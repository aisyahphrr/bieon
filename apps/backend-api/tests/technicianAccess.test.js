const request = require('supertest');
const app = require('../src/app');
const TechnicianAccess = require('../src/models/TechnicianAccess');
const { createTestUser } = require('./utils/testHelper');

describe('Technician Access Endpoints', () => {
    let homeowner, technician;
    let activeSession;

    beforeEach(async () => {
        homeowner = await createTestUser({ role: 'Homeowner', email: 'ho@bieon.com', fullName: 'Budi Homeowner' });
        technician = await createTestUser({ role: 'Technician', email: 'tech@bieon.com', fullName: 'Andi Teknisi' });
    });

    describe('POST /api/technician-access/generate-token', () => {
        it('should generate an access token for a valid Homeowner', async () => {
            const res = await request(app)
                .post('/api/technician-access/generate-token')
                .send({ homeownerId: homeowner._id.toString() });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.token).toHaveLength(6);
            expect(res.body).toHaveProperty('expiresAt');

            // Verify in DB
            const access = await TechnicianAccess.findOne({ homeownerId: homeowner._id });
            expect(access).toBeTruthy();
            expect(access.status).toEqual('Pending');
        });

        it('should return 400 if homeownerId is invalid or not a Homeowner', async () => {
            const res = await request(app)
                .post('/api/technician-access/generate-token')
                .send({ homeownerId: technician._id.toString() }); // Passing technician ID

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'User bukan Homeowner atau tidak ditemukan');
        });

        it('should invalidate previous pending tokens when generating a new one', async () => {
            // Generate first token
            const res1 = await request(app)
                .post('/api/technician-access/generate-token')
                .send({ homeownerId: homeowner._id.toString() });
            const firstToken = res1.body.token;

            // Generate second token (should expire the first)
            await request(app)
                .post('/api/technician-access/generate-token')
                .send({ homeownerId: homeowner._id.toString() });

            const oldAccess = await TechnicianAccess.findOne({ token: firstToken });
            expect(oldAccess.status).toEqual('Expired');
        });
    });

    describe('POST /api/technician-access/validate-token', () => {
        let validToken;

        beforeEach(async () => {
            // Generate a fresh token for these tests
            const res = await request(app)
                .post('/api/technician-access/generate-token')
                .send({ homeownerId: homeowner._id.toString() });
            validToken = res.body.token;
        });

        it('should start a session with a valid token', async () => {
            const res = await request(app)
                .post('/api/technician-access/validate-token')
                .send({ token: validToken, technicianId: technician._id.toString() });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('homeownerName');
            expect(res.body.homeownerName).toEqual('Budi Homeowner');
            expect(res.body.session.status).toEqual('Active');
        });

        it('should return 404 for an invalid or wrong token', async () => {
            const res = await request(app)
                .post('/api/technician-access/validate-token')
                .send({ token: 'XXXXXX', technicianId: technician._id.toString() });

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Token tidak valid');
        });
    });

    describe('GET /api/technician-access/status/:homeownerId', () => {
        it('should return isAccessed: false when no active session', async () => {
            const res = await request(app)
                .get(`/api/technician-access/status/${homeowner._id}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.isAccessed).toBe(false);
        });

        it('should return isAccessed: true when there is an active session', async () => {
            // Create active session manually
            await TechnicianAccess.create({
                homeownerId: homeowner._id,
                token: 'ACTIVE1',
                tokenExpiresAt: new Date(Date.now() + 60000),
                status: 'Active',
                technicianId: technician._id,
                startTime: new Date(),
                endTime: new Date(Date.now() + 30 * 60 * 1000)
            });

            const res = await request(app)
                .get(`/api/technician-access/status/${homeowner._id}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.isAccessed).toBe(true);
            expect(res.body.status).toEqual('Active');
        });
    });

    describe('POST /api/technician-access/submit-report', () => {
        let activeSessionId;

        beforeEach(async () => {
            const session = await TechnicianAccess.create({
                homeownerId: homeowner._id,
                token: 'RPT001',
                tokenExpiresAt: new Date(Date.now() + 60000),
                status: 'Active',
                technicianId: technician._id,
                startTime: new Date(),
                endTime: new Date(Date.now() + 30 * 60 * 1000)
            });
            activeSessionId = session._id;
        });

        it('should submit a report and close the session', async () => {
            const res = await request(app)
                .post(`/api/technician-access/report/${activeSessionId}`)
                .send({ report: 'Pengecekan selesai, semua perangkat berfungsi normal.' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.session.status).toEqual('Completed');
            expect(res.body.session.report).toEqual('Pengecekan selesai, semua perangkat berfungsi normal.');
        });

        it('should return 400 if report is empty', async () => {
            const res = await request(app)
                .post(`/api/technician-access/report/${activeSessionId}`)
                .send({ report: '' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('Laporan wajib diisi');
        });
    });
});
