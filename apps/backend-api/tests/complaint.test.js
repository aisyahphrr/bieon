const request = require('supertest');
const app = require('../src/app');
const Complaint = require('../src/models/Complaint');
const User = require('../src/models/User');
const { createTestUser, generateTestToken } = require('./utils/testHelper');

describe('Complaint Endpoints', () => {
    let superAdmin, superAdminToken;
    let homeowner, homeownerToken;
    let technician, technicianToken;
    let testComplaint;

    beforeEach(async () => {
        superAdmin = await createTestUser({ role: 'SuperAdmin', email: 'sa@bieon.com', fullName: 'Super Admin' });
        superAdminToken = generateTestToken(superAdmin._id, 'SuperAdmin');

        homeowner = await createTestUser({ role: 'Homeowner', email: 'ho@bieon.com', fullName: 'Budi Homeowner' });
        homeownerToken = generateTestToken(homeowner._id, 'Homeowner');

        technician = await createTestUser({ role: 'Technician', email: 'tech@bieon.com', fullName: 'Andi Teknisi' });
        technicianToken = generateTestToken(technician._id, 'Technician');

        // Seed a complaint for use in update/get tests
        testComplaint = await Complaint.create({
            topic: 'Lampu Kamar Mati',
            category: 'Instalasi',
            device: 'Smart Bulb',
            desc: 'Lampu di kamar tidur tidak bisa dikontrol dari aplikasi.',
            homeowner: homeowner._id,
            status: 'unassigned',
            timeline: [{ time: new Date().toISOString(), desc: 'Tiket dibuat', status: 'Baru' }]
        });
    });

    describe('POST /api/complaints', () => {
        it('should create a new complaint as Homeowner', async () => {
            const res = await request(app)
                .post('/api/complaints')
                .set('Authorization', `Bearer ${homeownerToken}`)
                .send({
                    topic: 'AC Rusak',
                    category: 'Perbaikan',
                    device: 'Smart AC',
                    desc: 'AC tidak bisa dinginkan ruangan.'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('complaint');
            expect(res.body.complaint.topic).toEqual('AC Rusak');
            expect(res.body.complaint.status).toEqual('unassigned');
        });

        it('should return 403 if Technician tries to create a complaint', async () => {
            const res = await request(app)
                .post('/api/complaints')
                .set('Authorization', `Bearer ${technicianToken}`)
                .send({
                    topic: 'Test',
                    category: 'Perbaikan',
                    device: 'Test Device',
                    desc: 'Test desc'
                });

            expect(res.statusCode).toEqual(403);
        });

        it('should return 401 without token', async () => {
            const res = await request(app).post('/api/complaints').send({});
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('GET /api/complaints/owner/:userId', () => {
        it('should return complaints belonging to the homeowner', async () => {
            const res = await request(app)
                .get(`/api/complaints/owner/${homeowner._id}`)
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            expect(res.body[0].topic).toEqual('Lampu Kamar Mati');
        });
    });

    describe('GET /api/complaints (SuperAdmin only)', () => {
        it('should return all complaints for SuperAdmin', async () => {
            const res = await request(app)
                .get('/api/complaints')
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should return 403 if Homeowner tries to get all complaints', async () => {
            const res = await request(app)
                .get('/api/complaints')
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/complaints/technician', () => {
        it('should return complaints assigned to the technician', async () => {
            // First assign the complaint to this technician
            await Complaint.findByIdAndUpdate(testComplaint._id, { technician: technician._id, status: 'menunggu respons' });

            const res = await request(app)
                .get('/api/complaints/technician')
                .set('Authorization', `Bearer ${technicianToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should return 403 for non-Technician role', async () => {
            const res = await request(app)
                .get('/api/complaints/technician')
                .set('Authorization', `Bearer ${homeownerToken}`);
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/complaints/:id', () => {
        it('should return complaint detail by ID', async () => {
            const res = await request(app)
                .get(`/api/complaints/${testComplaint._id}`)
                .set('Authorization', `Bearer ${homeownerToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.topic).toEqual('Lampu Kamar Mati');
        });

        it('should return 404 for non-existent complaint', async () => {
            const res = await request(app)
                .get('/api/complaints/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${superAdminToken}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('PUT /api/complaints/:id/assign', () => {
        it('should assign a technician to a complaint (SuperAdmin)', async () => {
            const res = await request(app)
                .put(`/api/complaints/${testComplaint._id}/assign`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({ technicianId: technician._id.toString() });

            expect(res.statusCode).toEqual(200);
            expect(res.body.complaint.technician.fullName).toEqual('Andi Teknisi');
            expect(res.body.complaint.status).toEqual('menunggu respons');
        });

        it('should return 404 if technician does not exist', async () => {
            const res = await request(app)
                .put(`/api/complaints/${testComplaint._id}/assign`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({ technicianId: '507f1f77bcf86cd799439011' });
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('PUT /api/complaints/:id/status', () => {
        it('should update complaint status to diproses', async () => {
            // Assign first
            await Complaint.findByIdAndUpdate(testComplaint._id, {
                technician: technician._id,
                assignedAt: new Date(),
                status: 'menunggu respons'
            });

            const res = await request(app)
                .put(`/api/complaints/${testComplaint._id}/status`)
                .set('Authorization', `Bearer ${technicianToken}`)
                .send({ status: 'diproses' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.complaint.status).toEqual('diproses');
        });
    });

    describe('PUT /api/complaints/:id/progress', () => {
        it('should update complaint progress timeline', async () => {
            await Complaint.findByIdAndUpdate(testComplaint._id, {
                technician: technician._id,
                status: 'diproses'
            });

            const res = await request(app)
                .put(`/api/complaints/${testComplaint._id}/progress`)
                .set('Authorization', `Bearer ${technicianToken}`)
                .send({ desc: 'Sedang melakukan pengecekan awal' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.complaint.timeline.length).toBeGreaterThan(1);
        });
    });

    describe('PUT /api/complaints/:id/grant-log', () => {
        it('should grant data log access (SuperAdmin)', async () => {
            await Complaint.findByIdAndUpdate(testComplaint._id, {
                technician: technician._id,
                logRequestStatus: 'pending'
            });

            const res = await request(app)
                .put(`/api/complaints/${testComplaint._id}/grant-log`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({ isApproved: true });

            expect(res.statusCode).toEqual(200);
            expect(res.body.complaint.logRequestStatus).toEqual('granted');
        });
    });
});
