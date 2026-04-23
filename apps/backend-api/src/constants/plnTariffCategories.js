const SEGMENTS = Object.freeze([
    'Rumah Tangga',
    'Bisnis',
    'Industri',
    'Pemerintah & PJU',
    'Layanan Khusus'
]);

const BASE_CATEGORIES = [
    // Rumah Tangga (Shortcut 7)
    { label: 'R1 - 450 VA (Subsidi)', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R1 - 900 VA (Subsidi)', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R1M - 900 VA (Non-Subsidi)', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R1 - 1300 VA', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R1 - 2200 VA', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R2 - 3500 s.d 5500 VA', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R3 - 6600 VA ke atas', segment: 'Rumah Tangga', isShortcut: true },

    // Bisnis
    { label: 'B-1/TR - 450–5.500 VA', segment: 'Bisnis', isShortcut: false },
    { label: 'B-2/TR - 6.600 VA–200 kVA', segment: 'Bisnis', isShortcut: false },
    { label: 'B-3/TM - >200 kVA', segment: 'Bisnis', isShortcut: false },

    // Industri
    { label: 'I-3/TM - >200 kVA', segment: 'Industri', isShortcut: false },
    { label: 'I-4/TT - ≥30.000 kVA', segment: 'Industri', isShortcut: false },

    // Pemerintah & PJU
    { label: 'P-1/TR - 6.600 VA–200 kVA', segment: 'Pemerintah & PJU', isShortcut: false },
    { label: 'P-2/TM - >200 kVA', segment: 'Pemerintah & PJU', isShortcut: false },
    { label: 'P-3/TR - Penerangan Jalan Umum (PJU)', segment: 'Pemerintah & PJU', isShortcut: false },

    // Layanan Khusus
    { label: 'L - TR/TM/TT', segment: 'Layanan Khusus', isShortcut: false },
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

