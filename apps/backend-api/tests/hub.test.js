const request = require('supertest');
const app = require('../src/app');
const BieonSystem = require('../src/models/BieonSystem');
const Hub = require('../src/models/Hub');
const { createTestUser } = require('./utils/testHelper');

describe('Hub Endpoints', () => {
    let testUser;

    beforeEach(async () => {
        testUser = await createTestUser();
    });

    describe('POST /api/hubs/setup', () => {
        it('should setup a new BIEON system with hubs successfully', async () => {
            const res = await request(app)
                .post('/api/hubs/setup')
                .send({
                    bieonId: 'BIEON-TEST-001',
                    totalHubs: 2,
                    userId: testUser._id
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'Sistem BIEON dan Hub berhasil disiapkan!');
            expect(res.body).toHaveProperty('system');
            expect(res.body).toHaveProperty('hubs');
            expect(res.body.hubs.length).toEqual(2);

            // Verify in DB
            const system = await BieonSystem.findOne({ bieonId: 'BIEON-TEST-001' });
            expect(system).toBeTruthy();
            expect(system.owner.toString()).toEqual(testUser._id.toString());

            const hubs = await Hub.find({ bieonId: 'BIEON-TEST-001' });
            expect(hubs.length).toEqual(2);
            expect(hubs[0].name).toEqual('Hub 1');
            expect(hubs[1].name).toEqual('Hub 2');
        });

        it('should return 400 if bieonId already exists', async () => {
            // First setup
            await request(app)
                .post('/api/hubs/setup')
                .send({
                    bieonId: 'BIEON-DUP-001',
                    totalHubs: 1,
                    userId: testUser._id
                });

            // Second setup with same bieonId
            const res = await request(app)
                .post('/api/hubs/setup')
                .send({
                    bieonId: 'BIEON-DUP-001',
                    totalHubs: 1,
                    userId: testUser._id
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'ID BIEON ini sudah digunakan di sistem kami!');
        });
    });

    describe('GET /api/hubs/systems/:userId', () => {
        it('should get all systems and their hubs for a user', async () => {
            // Setup a system first
            await request(app)
                .post('/api/hubs/setup')
                .send({
                    bieonId: 'BIEON-SYS-001',
                    totalHubs: 1,
                    userId: testUser._id
                });

            const res = await request(app)
                .get(`/api/hubs/systems/${testUser._id}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toEqual(1);
            expect(res.body[0].bieonId).toEqual('BIEON-SYS-001');
            expect(res.body[0].hubs.length).toEqual(1);
            expect(res.body[0].hubs[0].name).toEqual('Hub 1');
        });
    });

    describe('GET /api/hubs/user/:userId', () => {
        it('should get hubs based on bieonId (parameter named userId in route)', async () => {
             // Setup a system
             await request(app)
             .post('/api/hubs/setup')
             .send({
                 bieonId: 'BIEON-HUB-001',
                 totalHubs: 1,
                 userId: testUser._id
             });

             // The route is /user/:userId but controller looks for bieonId: req.params.userId
             const res = await request(app)
                 .get(`/api/hubs/user/BIEON-HUB-001`);
                 
             expect(res.statusCode).toEqual(200);
             expect(Array.isArray(res.body)).toBeTruthy();
             expect(res.body.length).toEqual(1);
             expect(res.body[0].bieonId).toEqual('BIEON-HUB-001');
        });
    });
});
