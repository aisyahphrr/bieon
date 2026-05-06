const request = require('supertest');
const app = require('../src/app');
const PlnTariff = require('../src/models/PlnTariff');
const { createTestUser, generateTestToken } = require('./utils/testHelper');

describe('PLN Tariff Endpoints', () => {
    let homeownerUser, superAdminUser;
    let homeownerToken, superAdminToken;

    beforeEach(async () => {
        homeownerUser = await createTestUser({ role: 'Homeowner', email: 'home@bieon.com' });
        homeownerToken = generateTestToken(homeownerUser._id, 'Homeowner');

        superAdminUser = await createTestUser({ role: 'SuperAdmin', email: 'admin@bieon.com' });
        superAdminToken = generateTestToken(superAdminUser._id, 'SuperAdmin');
    });

    describe('GET /api/admin/tariffs/public/categories', () => {
        it('should get public categories without token', async () => {
            const res = await request(app).get('/api/admin/tariffs/public/categories');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBeTruthy();
        });
    });

    describe('POST /api/admin/tariffs', () => {
        it('should return 401 if no token provided', async () => {
            const res = await request(app)
                .post('/api/admin/tariffs')
                .send({
                    category: 'R-1/TR - 1.300 VA',
                    tariff: 1444.70,
                    effectiveDate: new Date()
                });
            expect(res.statusCode).toEqual(401);
        });

        it('should return 403 if accessed by Homeowner', async () => {
            const res = await request(app)
                .post('/api/admin/tariffs')
                .set('Authorization', `Bearer ${homeownerToken}`)
                .send({
                    category: 'R-1/TR - 1.300 VA',
                    tariff: 1444.70,
                    effectiveDate: new Date()
                });
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toMatch(/Akses ditolak/);
        });

        it('should create new tariff if accessed by SuperAdmin', async () => {
            const res = await request(app)
                .post('/api/admin/tariffs')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({
                    category: 'R-1/TR - 1.300 VA', // Using valid label
                    tariff: 1444.70,
                    effectiveDate: '2026-01-01',
                    note: 'SK Baru'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.tariff).toEqual(1444.70);

            // Verify in DB
            const tariff = await PlnTariff.findOne({ category: 'R-1/TR - 1.300 VA' });
            expect(tariff).toBeTruthy();
            expect(tariff.tariff).toEqual(1444.70);
        });

        it('should return 400 for invalid category', async () => {
            const res = await request(app)
                .post('/api/admin/tariffs')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({
                    category: 'Kategori Palsu',
                    tariff: 1000,
                    effectiveDate: new Date()
                });
            
            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/admin/tariffs/current', () => {
        it('should get current tariffs for SuperAdmin', async () => {
            // Seed a tariff
            await PlnTariff.create({
                category: 'R-1/TR - 1.300 VA',
                tariff: 1400,
                effectiveDate: new Date(),
                updatedBy: superAdminUser._id
            });

            const res = await request(app)
                .get('/api/admin/tariffs/current')
                .set('Authorization', `Bearer ${superAdminToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBeTruthy();
            
            // Check if the seeded tariff is present in the response
            const r1 = res.body.data.find(d => d.name === 'R-1/TR - 1.300 VA');
            expect(r1).toBeTruthy();
            expect(r1.currentTariff).toEqual(1400);
        });
    });
});
