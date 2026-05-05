const request = require('supertest');
const app = require('../src/app');
const { createTestUser, generateTestToken } = require('./utils/testHelper');

describe('Technician Dashboard Endpoints', () => {
    let technician, technicianToken;
    let homeowner, homeownerToken;

    beforeEach(async () => {
        technician = await createTestUser({
            role: 'Technician',
            email: 'tech@bieon.com',
            fullName: 'Andi Teknisi'
        });
        technicianToken = generateTestToken(technician._id, 'Technician');

        homeowner = await createTestUser({ role: 'Homeowner', email: 'ho@bieon.com' });
        homeownerToken = generateTestToken(homeowner._id, 'Homeowner');
    });

    describe('GET /api/technician/dashboard/metrics', () => {
        it('should return dashboard metrics for Technician', async () => {
            const res = await request(app)
                .get('/api/technician/dashboard/metrics')
                .set('Authorization', `Bearer ${technicianToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });

        it('should return 401 without token', async () => {
            const res = await request(app)
                .get('/api/technician/dashboard/metrics');
            expect(res.statusCode).toEqual(401);
        });

        it('should return 403 if accessed by Homeowner', async () => {
            const res = await request(app)
                .get('/api/technician/dashboard/metrics')
                .set('Authorization', `Bearer ${homeownerToken}`);
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/technician/dashboard/charts', () => {
        it('should return chart data for Technician', async () => {
            const res = await request(app)
                .get('/api/technician/dashboard/charts')
                .set('Authorization', `Bearer ${technicianToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });

        it('should return 403 for non-Technician', async () => {
            const res = await request(app)
                .get('/api/technician/dashboard/charts')
                .set('Authorization', `Bearer ${homeownerToken}`);
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/technician/dashboard/clients', () => {
        it('should return client monitoring list for Technician', async () => {
            const res = await request(app)
                .get('/api/technician/dashboard/clients')
                .set('Authorization', `Bearer ${technicianToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should return 403 if accessed by Homeowner', async () => {
            const res = await request(app)
                .get('/api/technician/dashboard/clients')
                .set('Authorization', `Bearer ${homeownerToken}`);
            expect(res.statusCode).toEqual(403);
        });
    });
});
