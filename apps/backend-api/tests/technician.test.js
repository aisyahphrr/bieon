const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { createTestUser, generateTestToken } = require('./utils/testHelper');

describe('Technician Endpoints', () => {
    let technician, technicianToken;
    let homeowner, homeownerToken;

    beforeEach(async () => {
        technician = await createTestUser({
            role: 'Technician',
            email: 'tech@bieon.com',
            fullName: 'Andi Teknisi',
            position: 'Field Engineer',
            experience: 3
        });
        technicianToken = generateTestToken(technician._id, 'Technician');

        homeowner = await createTestUser({ role: 'Homeowner', email: 'ho@bieon.com' });
        homeownerToken = generateTestToken(homeowner._id, 'Homeowner');
    });

    describe('GET /api/technician/profile/:id', () => {
        it('should return technician profile with performance stats', async () => {
            const res = await request(app)
                .get(`/api/technician/profile/${technician._id}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('profile');
            expect(res.body.data).toHaveProperty('stats');
            expect(res.body.data.profile.email).toEqual('tech@bieon.com');
            expect(res.body.data.stats).toHaveProperty('totalPekerjaan');
            expect(res.body.data.stats).toHaveProperty('avgRating');
            expect(res.body.data.stats).toHaveProperty('complianceRate');
        });

        it('should return 404 for non-existent technician', async () => {
            const res = await request(app)
                .get('/api/technician/profile/507f1f77bcf86cd799439011');

            expect(res.statusCode).toEqual(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid ID format', async () => {
            const res = await request(app)
                .get('/api/technician/profile/invalid-id');

            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PUT /api/technician/profile/:id', () => {
        it('should update technician profile', async () => {
            const res = await request(app)
                .put(`/api/technician/profile/${technician._id}`)
                .send({
                    fullName: 'Andi Updated',
                    position: 'Senior Field Engineer',
                    workArea: 'Jakarta Selatan'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.fullName).toEqual('Andi Updated');
            expect(res.body.data.workArea).toEqual('Jakarta Selatan');
        });

        it('should not allow changing role or email via this endpoint', async () => {
            const res = await request(app)
                .put(`/api/technician/profile/${technician._id}`)
                .send({
                    role: 'SuperAdmin',    // should be ignored
                    email: 'hack@hack.com' // should be ignored
                });

            // Should still respond 200 but with original values
            expect(res.statusCode).toEqual(200);
            const dbUser = await User.findById(technician._id);
            expect(dbUser.role).toEqual('Technician');
            expect(dbUser.email).toEqual('tech@bieon.com');
        });

        it('should return 404 for non-existent technician', async () => {
            const res = await request(app)
                .put('/api/technician/profile/507f1f77bcf86cd799439011')
                .send({ fullName: 'Ghost' });
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('POST /api/technician/location', () => {
        it('should update location for Technician', async () => {
            const res = await request(app)
                .post('/api/technician/location')
                .set('Authorization', `Bearer ${technicianToken}`)
                .send({
                    lat: -6.2146,
                    lng: 106.8451,
                    accuracy: 10,
                    source: 'browser',
                    label: 'Kantor BIEON'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('lat');
        });

        it('should return 403 for Homeowner trying to update location', async () => {
            const res = await request(app)
                .post('/api/technician/location')
                .set('Authorization', `Bearer ${homeownerToken}`)
                .send({ lat: -6.2146, lng: 106.8451 });

            expect(res.statusCode).toEqual(403);
        });

        it('should return 401 without token', async () => {
            const res = await request(app)
                .post('/api/technician/location')
                .send({ lat: -6.2146, lng: 106.8451 });
            expect(res.statusCode).toEqual(401);
        });
    });
});
