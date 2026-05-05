const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Hub = require('../src/models/Hub');
const { createTestUser, generateTestToken } = require('./utils/testHelper');

describe('Admin Endpoints', () => {
    let superAdmin, superAdminToken;
    let homeowner, homeownerToken;
    let technician, technicianToken;

    beforeEach(async () => {
        superAdmin = await createTestUser({ role: 'SuperAdmin', email: 'sa@bieon.com', fullName: 'Super Admin' });
        superAdminToken = generateTestToken(superAdmin._id, 'SuperAdmin');

        homeowner = await createTestUser({ role: 'Homeowner', email: 'ho@bieon.com', fullName: 'Test Homeowner' });
        homeownerToken = generateTestToken(homeowner._id, 'Homeowner');

        technician = await createTestUser({ role: 'Technician', email: 'tech@bieon.com', fullName: 'Test Teknisi' });
        technicianToken = generateTestToken(technician._id, 'Technician');
    });

    // =============================================
    // HOMEOWNER MANAGEMENT
    // =============================================
    describe('GET /api/admin/homeowners', () => {
        it('should return all homeowners for SuperAdmin', async () => {
            const res = await request(app)
                .get('/api/admin/homeowners')
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('total');
        });

        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/admin/homeowners');
            expect(res.statusCode).toEqual(401);
        });

        it('should return 403 if accessed by Homeowner', async () => {
            const res = await request(app)
                .get('/api/admin/homeowners')
                .set('Authorization', `Bearer ${homeownerToken}`);
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('POST /api/admin/homeowners', () => {
        it('should create a new homeowner as SuperAdmin', async () => {
            const res = await request(app)
                .post('/api/admin/homeowners')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({
                    fullName: 'New Homeowner',
                    email: 'newhomeowner@bieon.com',
                    password: 'password123',
                    phoneNumber: '+6281234567890'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toEqual('newhomeowner@bieon.com');

            // Verify in DB
            const dbUser = await User.findOne({ email: 'newhomeowner@bieon.com' });
            expect(dbUser).toBeTruthy();
            expect(dbUser.role).toEqual('Homeowner');
        });

        it('should return error when email already exists', async () => {
            const res = await request(app)
                .post('/api/admin/homeowners')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({
                    fullName: 'Duplicate',
                    email: 'ho@bieon.com', // already exists
                    password: 'password123'
                });

            expect(res.statusCode).toBeGreaterThanOrEqual(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/admin/homeowners/:id', () => {
        it('should return homeowner details for SuperAdmin', async () => {
            const res = await request(app)
                .get(`/api/admin/homeowners/${homeowner._id}`)
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toEqual('ho@bieon.com');
        });
    });

    describe('PUT /api/admin/homeowners/:id', () => {
        it('should update homeowner data', async () => {
            const res = await request(app)
                .put(`/api/admin/homeowners/${homeowner._id}`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({
                    fullName: 'Updated Homeowner Name',
                    email: 'ho@bieon.com' // Required by service validation
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.fullName).toEqual('Updated Homeowner Name');
        });
    });

    // =============================================
    // TECHNICIAN MANAGEMENT
    // =============================================
    describe('POST /api/admin/technicians', () => {
        it('should create a new technician as SuperAdmin', async () => {
            const res = await request(app)
                .post('/api/admin/technicians')
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({
                    fullName: 'Teknisi Baru',
                    email: 'teknisibaru@bieon.com',
                    password: 'password123',
                    phoneNumber: '+6281234567890',
                    address: 'Jl. Test No.1, Jakarta',
                    position: 'Field Engineer',
                    workArea: 'Jakarta Selatan'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toEqual('Technician');
        });
    });

    describe('GET /api/admin/technicians', () => {
        it('should return all technicians for SuperAdmin', async () => {
            const res = await request(app)
                .get('/api/admin/technicians')
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /api/admin/technicians/:id', () => {
        it('should return a specific technician by ID', async () => {
            const res = await request(app)
                .get(`/api/admin/technicians/${technician._id}`)
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toEqual('tech@bieon.com');
        });
    });

    describe('POST /api/admin/technicians/:id/assign-clients', () => {
        it('should return 400 if clientIds is not an array', async () => {
            const res = await request(app)
                .post(`/api/admin/technicians/${technician._id}/assign-clients`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({ clientIds: 'not-an-array' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toEqual('clientIds harus berupa array.');
        });

        it('should assign homeowners to a technician', async () => {
            const res = await request(app)
                .post(`/api/admin/technicians/${technician._id}/assign-clients`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({ clientIds: [homeowner._id.toString()] });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);

            const updatedHO = await User.findById(homeowner._id);
            expect(updatedHO.assignedTechnician.toString()).toEqual(technician._id.toString());
        });
    });

    // =============================================
    // DASHBOARD & SYSTEMS
    // =============================================
    describe('GET /api/admin/dashboard/metrics', () => {
        it('should return dashboard metrics for SuperAdmin', async () => {
            const res = await request(app)
                .get('/api/admin/dashboard/metrics')
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });
    });

    describe('GET /api/admin/all-bieon-systems', () => {
        it('should return all BIEON systems', async () => {
            const res = await request(app)
                .get('/api/admin/all-bieon-systems')
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /api/admin/bieon-systems/:homeownerId', () => {
        it('should return bieon systems for a specific homeowner', async () => {
            // Create a hub for the homeowner first
            await Hub.create({ name: 'Hub Test', bieonId: 'BN-ADMIN-001', owner: homeowner._id, status: 'Online' });

            const res = await request(app)
                .get(`/api/admin/bieon-systems/${homeowner._id}`)
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toEqual(1);
        });
    });

    describe('GET /api/admin/homeowners/available', () => {
        it('should return homeowners without assigned technician', async () => {
            const res = await request(app)
                .get('/api/admin/homeowners/available')
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
