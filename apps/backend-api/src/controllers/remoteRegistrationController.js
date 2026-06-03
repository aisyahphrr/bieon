const RemoteRawBitCatalog = require('../models/RemoteRawBitCatalog');
const { publishRemoteRegistration } = require('../config/mqtt');
const { normalizeBieonId } = require('../shared/bieonId');

const allowedUpdateFields = [
    'deviceType',
    'controlGroup',
    'controlAction',
    'controlLabel',
    'controlSchema',
    'notes',
    'isActive',
    'captureStatus'
];

exports.startRemoteRegistration = async (req, res) => {
    try {
        const bieonId = normalizeBieonId(req.params.bieonId || req.body?.bieonId);
        const duration = Math.max(Number(req.body?.duration) || 90, 1);

        if (!bieonId) {
            return res.status(400).json({ message: 'Bieon ID wajib diisi.' });
        }

        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const requestedBy = String(req.user.userId);
        const published = publishRemoteRegistration(bieonId, duration, {
            requestedBy,
            source: 'web',
            sessionId: req.body?.sessionId || `reg_${Date.now()}`
        });

        if (!published) {
            return res.status(409).json({
                message: `Mode registrasi untuk ${bieonId} sudah aktif atau broker belum siap.`
            });
        }

        return res.status(200).json({
            message: `Mode registrasi remote aktif untuk ${bieonId} selama ${duration} detik.`,
            bieonId,
            duration,
            topic: `bieon/${bieonId}/admin/registration`
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal memulai mode registrasi remote',
            error: error.message
        });
    }
};

exports.getRawBitCatalog = async (req, res) => {
    try {
        const bieonId = normalizeBieonId(req.params.bieonId || req.query?.bieonId);

        if (!bieonId) {
            return res.status(400).json({ message: 'Bieon ID wajib diisi.' });
        }

        const filter = { bieonId };
        if (String(req.query?.activeOnly || '').toLowerCase() === 'true') {
            filter.isActive = true;
        }

        const items = await RemoteRawBitCatalog.find(filter)
            .sort({ lastSeenAt: -1, createdAt: -1 })
            .lean();

        return res.status(200).json({
            bieonId,
            count: items.length,
            items
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal mengambil katalog raw bit',
            error: error.message
        });
    }
};

exports.updateRawBitCatalog = async (req, res) => {
    try {
        const { catalogId } = req.params;
        if (!catalogId) {
            return res.status(400).json({ message: 'catalogId wajib diisi.' });
        }

        const updates = {};
        for (const field of allowedUpdateFields) {
            if (req.body && Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'Tidak ada data yang perlu diperbarui.' });
        }

        if (updates.captureStatus === 'mapped') {
            updates.isActive = true;
        }

        const updated = await RemoteRawBitCatalog.findByIdAndUpdate(
            catalogId,
            { $set: updates },
            { new: true, runValidators: true }
        ).lean();

        if (!updated) {
            return res.status(404).json({ message: 'Raw bit catalog tidak ditemukan.' });
        }

        return res.status(200).json({
            message: 'Raw bit catalog berhasil diperbarui.',
            item: updated
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Gagal memperbarui raw bit catalog',
            error: error.message
        });
    }
};