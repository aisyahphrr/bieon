/**
 * Normalisasi & pencocokan Bieon ID:
 * - Huruf besar/kecil diabaikan (bieon_001 = BIEON-001)
 * - Tanda - dan _ dianggap sama
 * - Angka sama dianggap sama (001 = 1 = 01) untuk pola bieon_XXX
 */

const BIEON_NUMERIC_PATTERN = /^bieon[-_]?(\d+)$/i;

/**
 * @param {string} input
 * @returns {string} Bentuk kanonik (mis. bieon_001) atau lowercase+underscore untuk ID non-numerik
 */
function normalizeBieonId(input) {
    if (input === null || input === undefined) return '';
    const trimmed = String(input).trim();
    if (!trimmed) return '';

    const lowered = trimmed.toLowerCase().replace(/-/g, '_');
    const numericMatch = lowered.match(BIEON_NUMERIC_PATTERN);

    if (numericMatch) {
        const num = parseInt(numericMatch[1], 10);
        if (!Number.isNaN(num)) {
            return `bieon_${String(num).padStart(3, '0')}`;
        }
    }

    return lowered;
}

/**
 * Filter MongoDB: cocokkan semua varian penulisan ID yang sama secara logika.
 * @param {string} input
 * @returns {{ bieonId: object }}
 */
function bieonIdFilter(input) {
    const canonical = normalizeBieonId(input);
    if (!canonical) {
        return { bieonId: '__invalid_empty__' };
    }

    const numericMatch = canonical.match(/^bieon_(\d+)$/);
    if (numericMatch) {
        const numInt = parseInt(numericMatch[1], 10);
        return {
            bieonId: { $regex: new RegExp(`^bieon[-_]?0*${numInt}$`, 'i') },
        };
    }

    const escaped = canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const flexible = escaped.replace(/_/g, '[-_]');
    return { bieonId: { $regex: new RegExp(`^${flexible}$`, 'i') } };
}

function findOneByBieonId(Model, input) {
    return Model.findOne(bieonIdFilter(input));
}

function findManyByBieonId(Model, input) {
    return Model.find(bieonIdFilter(input));
}

function deleteManyByBieonId(Model, input) {
    return Model.deleteMany(bieonIdFilter(input));
}

function updateManyByBieonId(Model, input, update, options) {
    return Model.updateMany(bieonIdFilter(input), update, options);
}

function countByBieonId(Model, input) {
    return Model.countDocuments(bieonIdFilter(input));
}

/**
 * Dua ID dianggap sama jika normalisasi logikanya sama.
 */
function bieonIdsEqual(a, b) {
    return normalizeBieonId(a) === normalizeBieonId(b);
}

module.exports = {
    normalizeBieonId,
    bieonIdFilter,
    bieonIdsEqual,
    findOneByBieonId,
    findManyByBieonId,
    deleteManyByBieonId,
    updateManyByBieonId,
    countByBieonId,
};
