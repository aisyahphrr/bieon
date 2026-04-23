const PlnTariff = require('../models/PlnTariff');
const User = require('../models/User');
const { getPlnTariffCategories, isValidPlnTariffCategoryLabel } = require('../constants/plnTariffCategories');

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const formatIndonesianDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

const formatTimestamp = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

const normalizeCategoryLabel = (value = '') => String(value)
    .toLowerCase()
    .replace(/[–—−]/g, '-') // normalize dash variants
    .replace(/s\.?\s*d\.?/g, 'sd') // normalize "s.d" variants
    .replace(/[^a-z0-9]/g, '');

/**
 * GET /api/admin/tariffs/public/categories
 * Mengembalikan daftar kategori/golongan tarif PLN (public).
 * Query:
 * - scope=all|shortcut (default all)
 * - segment=Rumah Tangga|Bisnis|Industri|Pemerintah & PJU|Layanan Khusus
 */
exports.getCategories = (req, res) => {
    const { scope = 'all', segment } = req.query;
    const result = getPlnTariffCategories({ scope, segment });

    if (!result.ok) {
        return res.status(400).json({ success: false, message: result.error });
    }

    return res.status(200).json({ success: true, data: result.data });
};

/**
 * GET /api/admin/tariffs/current
 * Mendapatkan tarif terkini untuk setiap golongan
 */
exports.getCurrentTariffs = async (req, res) => {
    try {
        const { scope = 'shortcut' } = req.query;
        const categoryResult = getPlnTariffCategories({ scope });
        const CATEGORIES = categoryResult.ok ? categoryResult.data.map((c) => c.label) : [];
        const allTariffs = await PlnTariff.find()
            .sort({ createdAt: -1 })
            .lean();

        const groupedByNormalized = allTariffs.reduce((acc, item) => {
            const key = normalizeCategoryLabel(item.category);
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});

        const result = await Promise.all(CATEGORIES.map(async (cat) => {
            const normalizedCategory = normalizeCategoryLabel(cat);
            const matchedTariffs = groupedByNormalized[normalizedCategory] || [];
            const latest = matchedTariffs[0] || null;
            const totalChanges = matchedTariffs.length;
            const first = matchedTariffs.length ? matchedTariffs[matchedTariffs.length - 1] : null;

            if (!latest) {
                return {
                    name: cat,
                    currentTariff: 0,
                    percentage: 0,
                    effectiveDate: '-',
                    skNo: '-',
                    totalChanges: 0,
                    lastChangeSince: '-'
                };
            }

            const firstDate = first ? new Date(first.createdAt) : new Date();
            const lastChangeSince = `${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][firstDate.getMonth()]} ${firstDate.getFullYear()}`;

            return {
                name: cat,
                currentTariff: latest.tariff,
                percentage: latest.percentage,
                effectiveDate: formatIndonesianDate(latest.effectiveDate),
                skNo: latest.note || '-',
                totalChanges,
                lastChangeSince
            };
        }));

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data tarif.', error: error.message });
    }
};

/**
 * POST /api/admin/tariffs
 * Membuat tarif baru / update tarif untuk satu golongan
 */
exports.createTariff = async (req, res) => {
    try {
        const { category, tariff, effectiveDate, note } = req.body;

        if (!category || !tariff || !effectiveDate) {
            return res.status(400).json({ success: false, message: 'category, tariff, dan effectiveDate wajib diisi.' });
        }

        if (!isValidPlnTariffCategoryLabel(category)) {
            return res.status(400).json({
                success: false,
                message: 'Kategori PLN tidak valid. Ambil daftar dari /api/admin/tariffs/public/categories.'
            });
        }

        // Cari tarif sebelumnya untuk hitung persentase perubahan
        const previousTariff = await PlnTariff.findOne({ category }).sort({ createdAt: -1 }).lean();
        let percentage = 0;
        if (previousTariff && previousTariff.tariff > 0) {
            percentage = ((tariff - previousTariff.tariff) / previousTariff.tariff) * 100;
            percentage = parseFloat(percentage.toFixed(2));
        }

        const newTariff = new PlnTariff({
            category,
            tariff: parseFloat(tariff),
            effectiveDate: new Date(effectiveDate),
            note: note || '',
            updatedBy: req.user.userId,
            percentage
        });

        await newTariff.save();

        res.status(201).json({
            success: true,
            message: `Tarif untuk ${category} berhasil diperbarui.`,
            data: newTariff
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menyimpan tarif baru.', error: error.message });
    }
};

/**
 * GET /api/admin/tariffs/history
 * Riwayat semua perubahan tarif, bisa difilter per golongan
 */
exports.getHistory = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = {};
        if (category && category !== 'All') filter.category = category;

        const history = await PlnTariff.find(filter)
            .sort({ createdAt: -1 })
            .populate('updatedBy', 'fullName')
            .lean();

        const formatted = history.map((item, index) => {
            // Generate ID dari jumlah total record
            const idNum = String(history.length - index).padStart(3, '0');
            return {
                id: `TRF-${idNum}`,
                tariff: item.tariff,
                category: item.category,
                date: formatIndonesianDate(item.effectiveDate),
                author: item.updatedBy ? item.updatedBy.fullName : 'Super Admin',
                timestamp: formatTimestamp(item.createdAt),
                note: item.note || '-',
                percentage: item.percentage,
                _id: item._id
            };
        });

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil riwayat tarif.', error: error.message });
    }
};

/**
 * GET /api/admin/tariffs/distribution
 * Distribusi pelanggan BIEON berdasarkan golongan PLN (untuk Pie Chart)
 */
exports.getDistribution = async (req, res) => {
    try {
        const result = await User.aggregate([
            { $match: { role: 'Homeowner', plnTariff: { $exists: true, $ne: '' } } },
            { $group: { _id: '$plnTariff', value: { $sum: 1 } } },
            { $project: { _id: 0, name: '$_id', value: 1 } },
            { $sort: { value: -1 } }
        ]);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil distribusi pelanggan.', error: error.message });
    }
};

/**
 * GET /api/admin/tariffs/trend
 * Data tren tarif per kuartal untuk semua golongan utama (untuk Line Chart)
 */
exports.getTrend = async (req, res) => {
    try {
        const trendCategories = ['R1 - 1300 VA', 'R2 - 3500 s.d 5500 VA', 'R3 - 6600 VA ke atas'];
        const trendCategorySet = new Set(trendCategories.map(normalizeCategoryLabel));
        const allTariffs = await PlnTariff.find()
            .sort({ effectiveDate: 1 })
            .lean();
        const history = allTariffs.filter((item) => trendCategorySet.has(normalizeCategoryLabel(item.category)));

        // Group per kuartal
        const quarterMap = {};
        history.forEach(item => {
            const d = new Date(item.effectiveDate);
            const q = Math.floor(d.getMonth() / 3) + 1;
            const key = `Q${q} (${d.getFullYear()})`;
            if (!quarterMap[key]) quarterMap[key] = { name: key, r1: null, r2: null, r3: null };

            if (item.category === 'R1 - 1300 VA') quarterMap[key].r1 = item.tariff;
            if (item.category === 'R2 - 3500 s.d 5500 VA') quarterMap[key].r2 = item.tariff;
            if (item.category === 'R3 - 6600 VA ke atas') quarterMap[key].r3 = item.tariff;
        });

        const trendData = Object.values(quarterMap).filter(q => q.r1 || q.r2 || q.r3);

        res.status(200).json({ success: true, data: trendData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil data tren tarif.', error: error.message });
    }
};

/**
 * GET /api/admin/tariffs/summary
 * Memberikan ringkasan data tarif PLN untuk widget dashboard
 */
exports.getPlnSummary = async (req, res) => {
    try {
        const categories = getPlnTariffCategories({ scope: 'all' });
        if (!categories.ok) throw new Error(categories.error);

        const segmentCounts = categories.data.reduce((acc, c) => {
            acc[c.segment] = (acc[c.segment] || 0) + 1;
            return acc;
        }, {});

        const latestUpdate = await PlnTariff.findOne()
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: {
                totalCategories: categories.data.length,
                totalSegments: Object.keys(segmentCounts).length,
                segmentCounts,
                latestUpdate: latestUpdate ? {
                    category: latestUpdate.category,
                    tariff: latestUpdate.tariff,
                    date: formatIndonesianDate(latestUpdate.effectiveDate),
                    percentage: latestUpdate.percentage
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil ringkasan tarif.', error: error.message });
    }
};
