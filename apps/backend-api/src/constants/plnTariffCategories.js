const SEGMENTS = Object.freeze([
    'Subsidi Rumah Tangga',
    'Rumah Tangga',
    'Bisnis',
    'Industri',
    'Pemerintah & PJU',
    'Pelayanan Sosial'
]);

const BASE_CATEGORIES = [
    // Subsidi Rumah Tangga
    { label: 'R-1/TR - 450 VA (Subsidi)', segment: 'Subsidi Rumah Tangga', isShortcut: true },
    { label: 'R-1/TR - 900 VA (Subsidi)', segment: 'Subsidi Rumah Tangga', isShortcut: true },

    // Rumah Tangga
    { label: 'R-1/TR - 900 VA (Non-Subsidi)', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R-1/TR - 1.300 VA', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R-1/TR - 2.200 VA', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R-2/TR - 3.500-5.500 VA', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R-3/TR, TM - > 6.600 VA', segment: 'Rumah Tangga', isShortcut: true },

    // Bisnis
    { label: 'B-2/TR - 6.600 VA-200 kVA', segment: 'Bisnis', isShortcut: false },
    { label: 'B-3/TM, TT - > 200 kVA', segment: 'Bisnis', isShortcut: false },

    // Industri
    { label: 'I-3/TM - > 200 kVA', segment: 'Industri', isShortcut: false },
    { label: 'I-4/TT - > 30.000 kVA', segment: 'Industri', isShortcut: false },

    // Pemerintah & PJU
    { label: 'P-1/TR - 6.600 VA-200 kVA', segment: 'Pemerintah & PJU', isShortcut: false },
    { label: 'P-2/TM - > 200 kVA', segment: 'Pemerintah & PJU', isShortcut: false },
    { label: 'P-3/TR - Penerangan Jalan Umum', segment: 'Pemerintah & PJU', isShortcut: false },
    { label: 'L/TR, TM, TT', segment: 'Pemerintah & PJU', isShortcut: false },

    // Pelayanan Sosial
    { label: 'S-1/TR - 450 VA', segment: 'Pelayanan Sosial', isShortcut: false },
    { label: 'S-1/TR - 900 VA', segment: 'Pelayanan Sosial', isShortcut: false },
    { label: 'S-1/TR - 1.300 VA', segment: 'Pelayanan Sosial', isShortcut: false },
    { label: 'S-1/TR - 2.200 VA', segment: 'Pelayanan Sosial', isShortcut: false },
    { label: 'S-1/TR - 3.500 VA-200 kVA', segment: 'Pelayanan Sosial', isShortcut: false },
    { label: 'S-2/TM - > 200 kVA', segment: 'Pelayanan Sosial', isShortcut: false },
];

const makeKey = (label) => String(label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const plnTariffCategories = Object.freeze(
    BASE_CATEGORIES.map((c) => ({
        key: makeKey(c.label),
        label: c.label,
        segment: c.segment,
        isShortcut: Boolean(c.isShortcut)
    }))
);

const labelSet = new Set(plnTariffCategories.map((c) => c.label));

const isValidPlnTariffCategoryLabel = (label) => labelSet.has(label);

const getPlnTariffCategories = ({ scope = 'all', segment } = {}) => {
    const normalizedScope = String(scope || 'all').toLowerCase();
    if (!['all', 'shortcut'].includes(normalizedScope)) {
        return { ok: false, error: 'scope harus bernilai "all" atau "shortcut".' };
    }

    if (segment && !SEGMENTS.includes(segment)) {
        return { ok: false, error: `segment tidak valid. Pilihan: ${SEGMENTS.join(', ')}` };
    }

    let data = plnTariffCategories;
    if (normalizedScope === 'shortcut') data = data.filter((c) => c.isShortcut);
    if (segment) data = data.filter((c) => c.segment === segment);

    return { ok: true, data };
};

module.exports = {
    SEGMENTS,
    plnTariffCategories,
    makeKey,
    isValidPlnTariffCategoryLabel,
    getPlnTariffCategories
};

