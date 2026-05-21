const {
    normalizeBieonId,
    bieonIdsEqual,
    bieonIdFilter,
} = require('../src/shared/bieonId');

describe('bieonId normalization', () => {
    it('treats case and separators as equivalent for numeric IDs', () => {
        expect(normalizeBieonId('bieon_001')).toBe('bieon_001');
        expect(normalizeBieonId('BIEON-001')).toBe('bieon_001');
        expect(normalizeBieonId('BIEON_001')).toBe('bieon_001');
        expect(normalizeBieonId('bieon-1')).toBe('bieon_001');
        expect(normalizeBieonId('BIEON_1')).toBe('bieon_001');
    });

    it('compares IDs by normalized value', () => {
        expect(bieonIdsEqual('bieon_001', 'BIEON-001')).toBe(true);
        expect(bieonIdsEqual('bieon_002', 'BIEON-001')).toBe(false);
    });

    it('builds regex that matches numeric variants', () => {
        const filter = bieonIdFilter('BIEON-001');
        expect(filter.bieonId.$regex.test('bieon_001')).toBe(true);
        expect(filter.bieonId.$regex.test('BIEON_1')).toBe(true);
        expect(filter.bieonId.$regex.test('bieon_002')).toBe(false);
    });
});
