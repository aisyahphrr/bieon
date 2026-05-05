const request = require('supertest');
const app = require('../src/app');
const Alert = require('../src/models/Alert');
const { createTestUser, generateTestToken } = require('./utils/testHelper');

describe('History Endpoints', () => {
    let homeowner, homeownerToken;

    beforeEach(async () => {
        homeowner = await createTestUser({ role: 'Homeowner', email: 'ho@bieon.com' });
        homeownerToken = generateTestToken(homeowner._id, 'Homeowner');
    });

    // =============================================
    // ALL HISTORY ROUTES REQUIRE AUTH
    // =============================================
    describe('Authentication Guard', () => {
        const protectedRoutes = [
            '/api/history/environment',
            '/api/history/security',
            '/api/history/water',
            '/api/history/energy',
            '/api/history/activity',
            '/api/history/alerts'
        ];

        protectedRoutes.forEach(route => {
            it(`GET ${route} should return 401 without token`, async () => {
                const res = await request(app).get(route);
                expect(res.statusCode).toEqual(401);
            });
        });
    });

    // =============================================
    // ENVIRONMENT HISTORY
    // =============================================
    describe('GET /api/history/environment', () => {
        it('should return environment history data (may be empty)', async () => {
            const res = await request(app)
                .get('/api/history/environment')
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    // =============================================
    // ENERGY HISTORY
    // =============================================
    describe('GET /api/history/energy', () => {
        it('should return energy history data', async () => {
            const res = await request(app)
                .get('/api/history/energy')
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    // =============================================
    // SECURITY HISTORY
    // =============================================
    describe('GET /api/history/security', () => {
        it('should return security history data', async () => {
            const res = await request(app)
                .get('/api/history/security')
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });
    });

    // =============================================
    // WATER HISTORY
    // =============================================
    describe('GET /api/history/water', () => {
        it('should return water quality history data', async () => {
            const res = await request(app)
                .get('/api/history/water')
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });
    });

    // =============================================
    // ACTIVITY HISTORY
    // =============================================
    describe('GET /api/history/activity', () => {
        it('should return activity history data', async () => {
            const res = await request(app)
                .get('/api/history/activity')
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });
    });

    // =============================================
    // ALERT HISTORY
    // =============================================
    describe('GET /api/history/alerts', () => {
        it('should return alert history for user', async () => {
            // Seed an alert
            await Alert.create({
                owner: homeowner._id,
                category: 'Keamanan',
                message: 'Test history alert',
                type: 'Info'
            });

            const res = await request(app)
                .get('/api/history/alerts')
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('PUT /api/history/alerts/:id/read', () => {
        it('should mark a specific alert as read', async () => {
            const alert = await Alert.create({
                owner: homeowner._id,
                category: 'Energi',
                message: 'Listrik mendekati batas.',
                type: 'Warning',
                isRead: false
            });

            const res = await request(app)
                .put(`/api/history/alerts/${alert._id}/read`)
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);

            const updated = await Alert.findById(alert._id);
            expect(updated.isRead).toBe(true);
        });
    });

    describe('PUT /api/history/alerts/read-all', () => {
        it('should mark all alerts as read', async () => {
            await Alert.create([
                { owner: homeowner._id, category: 'Sistem', message: 'Alert 1', type: 'Info', isRead: false },
                { owner: homeowner._id, category: 'Keamanan', message: 'Alert 2', type: 'Warning', isRead: false }
            ]);

            const res = await request(app)
                .put('/api/history/alerts/read-all')
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);

            const unreadAlerts = await Alert.find({ owner: homeowner._id, isRead: false });
            expect(unreadAlerts.length).toEqual(0);
        });
    });
});
