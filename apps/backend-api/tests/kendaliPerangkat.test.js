const request = require('supertest');
const app = require('../src/app');
const KendaliPerangkat = require('../src/models/KendaliPerangkat');
const Hub = require('../src/models/Hub');
const { createTestUser } = require('./utils/testHelper');

describe('Kendali Perangkat Endpoints', () => {
    let testUser;
    let testHub;

    beforeEach(async () => {
        testUser = await createTestUser();
        testHub = await Hub.create({
            name: 'Test Hub 1',
            bieonId: 'BIEON-KENDALI-001',
            owner: testUser._id,
            status: 'Online'
        });
    });

    describe('POST /api/kendaliperangkat/discover', () => {
        it('should detect a new device', async () => {
            const res = await request(app)
                .post('/api/kendaliperangkat/discover')
                .send({
                    hubId: testHub._id,
                    category: 'Control Actuator System',
                    type: 'Smart Plug',
                    ownerId: testUser._id
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'Perangkat baru terdeteksi!');
            expect(res.body.device.status).toEqual('Discovered');
            expect(res.body.device.name).toEqual('New Smart Plug');
        });
    });

    describe('POST /api/kendaliperangkat', () => {
        it('should save a new configured device directly', async () => {
            const res = await request(app)
                .post('/api/kendaliperangkat')
                .send({
                    name: 'Kipas Angin Ruang Tamu',
                    deviceType: 'Smart Plug',
                    category: 'Control Actuator System',
                    location: 'Ruang Tamu',
                    hubId: testHub._id,
                    ownerId: testUser._id,
                    controlMode: 'Manual'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'Perangkat berhasil disimpan ke database!');
            expect(res.body.device.status).toEqual('Active');
            expect(res.body.device.name).toEqual('Kipas Angin Ruang Tamu');
            expect(res.body.device.controlMethod).toEqual('Manual');
        });
    });

    describe('PUT /api/kendaliperangkat/configure/:id', () => {
        it('should configure an existing discovered device', async () => {
            // First, create a discovered device
            const device = await KendaliPerangkat.create({
                name: 'New Sensor',
                location: 'Pending',
                hubId: testHub._id,
                category: 'Sensor',
                type: 'Temperature Sensor',
                status: 'Discovered',
                owner: testUser._id
            });

            // Then configure it
            const res = await request(app)
                .put(`/api/kendaliperangkat/configure/${device._id}`)
                .send({
                    name: 'Sensor Suhu Kamar',
                    location: 'Kamar Tidur Utama',
                    controlMode: 'Lingkungan'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Konfigurasi berhasil simpan!');
            expect(res.body.device.status).toEqual('Active');
            expect(res.body.device.name).toEqual('Sensor Suhu Kamar');
            expect(res.body.device.location).toEqual('Kamar Tidur Utama');
            expect(res.body.device.controlMethod).toEqual('Lingkungan');
        });

        it('should return 404 if device not found', async () => {
            // using a fake but valid mongo ObjectId
            const res = await request(app)
                .put('/api/kendaliperangkat/configure/507f1f77bcf86cd799439011')
                .send({ name: 'Ghost Device' });

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Perangkat tidak ditemukan');
        });
    });

    describe('GET /api/kendaliperangkat/user/:userId', () => {
        it('should get all devices for a user', async () => {
            await KendaliPerangkat.create({
                name: 'Lampu Teras',
                location: 'Depan',
                hubId: testHub._id,
                category: 'Control Actuator System',
                type: 'Smart Bulb',
                status: 'Active',
                owner: testUser._id
            });

            const res = await request(app)
                .get(`/api/kendaliperangkat/user/${testUser._id}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toEqual(1);
            expect(res.body[0].name).toEqual('Lampu Teras');
        });
    });

    describe('DELETE /api/kendaliperangkat/:id', () => {
        it('should delete a device successfully', async () => {
            const device = await KendaliPerangkat.create({
                name: 'TV',
                location: 'Ruang Keluarga',
                hubId: testHub._id,
                category: 'Control Actuator System',
                type: 'Smart Plug',
                status: 'Active',
                owner: testUser._id
            });

            const res = await request(app)
                .delete(`/api/kendaliperangkat/${device._id}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Perangkat berhasil dihapus');

            const check = await KendaliPerangkat.findById(device._id);
            expect(check).toBeNull();
        });
    });
});
