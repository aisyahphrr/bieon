const request = require('supertest');
const app = require('../src/app');
const Alert = require('../src/models/Alert');
const { createTestUser, generateTestToken } = require('./utils/testHelper');

describe('Alert Endpoints', () => {
    let homeowner, homeownerToken;
    let otherUser, otherUserToken;
    let testAlert;

    beforeEach(async () => {
        homeowner = await createTestUser({ role: 'Homeowner', email: 'ho@bieon.com' });
        homeownerToken = generateTestToken(homeowner._id, 'Homeowner');

        otherUser = await createTestUser({ role: 'Homeowner', email: 'other@bieon.com' });
        otherUserToken = generateTestToken(otherUser._id, 'Homeowner');

        // Seed an alert for homeowner
        testAlert = await Alert.create({
            owner: homeowner._id,
            category: 'Keamanan',
            message: 'Sensor mendeteksi gerakan di teras.',
            type: 'Bahaya',
            isRead: false,
            isSeen: false
        });

        // Seed another alert (unread) for homeowner
        await Alert.create({
            owner: homeowner._id,
            category: 'Energi',
            message: 'Listrik hampir melebihi batas.',
            type: 'Warning',
            isRead: false,
            isSeen: false
        });
    });

    describe('GET /api/alerts', () => {
        it('should return only alerts belonging to the logged-in user', async () => {
            const res = await request(app)
                .get('/api/alerts')
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toEqual(2);

            // Make sure all alerts belong to this user
            res.body.data.forEach(alert => {
                expect(alert.owner.toString()).toEqual(homeowner._id.toString());
            });
        });

        it('should return empty array for user with no alerts', async () => {
            const noAlertUser = await createTestUser({ role: 'Homeowner', email: 'noalert@bieon.com' });
            const noAlertToken = generateTestToken(noAlertUser._id, 'Homeowner');

            const res = await request(app)
                .get('/api/alerts')
                .set('Authorization', `Bearer ${noAlertToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toEqual(0);
        });

        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/alerts');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('PUT /api/alerts/:id/read', () => {
        it('should mark a specific alert as read', async () => {
            const res = await request(app)
                .put(`/api/alerts/${testAlert._id}/read`)
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.isRead).toBe(true);

            // Verify in DB
            const updatedAlert = await Alert.findById(testAlert._id);
            expect(updatedAlert.isRead).toBe(true);
        });

        it('should return 404 if trying to mark another user alert as read', async () => {
            // Other user tries to mark homeowner's alert as read
            const res = await request(app)
                .put(`/api/alerts/${testAlert._id}/read`)
                .set('Authorization', `Bearer ${otherUserToken}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PUT /api/alerts/seen-all', () => {
        it('should mark all unseen alerts as seen', async () => {
            const res = await request(app)
                .put('/api/alerts/seen-all')
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);

            // Verify in DB
            const alerts = await Alert.find({ owner: homeowner._id, isSeen: false });
            expect(alerts.length).toEqual(0);
        });

        it('should only affect the logged-in user alerts', async () => {
            // Seed an unseen alert for the other user
            const otherAlert = await Alert.create({
                owner: otherUser._id,
                category: 'Sistem',
                message: 'Test alert other user',
                type: 'Info',
                isSeen: false
            });

            // Mark all as seen for homeowner
            await request(app)
                .put('/api/alerts/seen-all')
                .set('Authorization', `Bearer ${homeownerToken}`);

            // Other user's alert should remain unseen
            const otherUserAlert = await Alert.findById(otherAlert._id);
            expect(otherUserAlert.isSeen).toBe(false);
        });
    });
});
