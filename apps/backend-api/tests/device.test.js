const request = require('supertest');
const app = require('../src/app');
const Device = require('../src/models/Device');
const Hub = require('../src/models/Hub');
const { createTestUser } = require('./utils/testHelper');

describe('Device Endpoints', () => {
    let testUser;
    let testHub;

    beforeEach(async () => {
        testUser = await createTestUser();
        testHub = await Hub.create({
            name: 'Test Hub',
            bieonId: 'BIEON-DEVICE-TEST',
            owner: testUser._id,
            status: 'Online'
        });
    });

    describe('POST /api/devices/pairing/start', () => {
        it('should validate 14 digit QR code and start pairing', async () => {
            const res = await request(app)
                .post('/api/devices/pairing/start')
                .send({
                    qrCode: '12345678901234'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Mode pairing aktif (60s). Silakan tekan tombol pairing di alat kamu.');
        });

        it('should reject invalid QR code', async () => {
            const res = await request(app)
                .post('/api/devices/pairing/start')
                .send({
                    qrCode: '123' // Only 3 digits
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Format QR Code tidak valid (Harus 14 digit angka).');
        });
    });

    describe('POST /api/devices', () => {
        it('should create a new device assigned to a hub', async () => {
            const res = await request(app)
                .post('/api/devices')
                .send({
                    name: 'Smart Lamp',
                    type: 'Light',
                    hubId: testHub._id,
                    userId: testUser._id,
                    room: 'Living Room'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'Perangkat berhasil ditambahkan!');
            
            const dbDevice = await Device.findOne({ name: 'Smart Lamp' });
            expect(dbDevice).toBeTruthy();
            expect(dbDevice.owner.toString()).toEqual(testUser._id.toString());
            expect(dbDevice.room).toEqual('Living Room');
        });
    });

    describe('GET /api/devices/owner/:userId', () => {
        it('should return all devices owned by the user', async () => {
            await Device.create({
                name: 'AC Bedroom',
                type: 'AC',
                hub: testHub._id,
                owner: testUser._id,
                room: 'Bedroom'
            });

            const res = await request(app)
                .get(`/api/devices/owner/${testUser._id}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toEqual(1);
            expect(res.body[0].name).toEqual('AC Bedroom');
        });
    });

    describe('GET /api/devices/unassigned', () => {
        it('should return all unassigned devices', async () => {
            await Device.create({
                name: 'New Unknown Device',
                type: 'Unassigned',
                ieeeAddress: '0x00123',
                model: 'Unknown'
            });

            const res = await request(app)
                .get('/api/devices/unassigned');

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toEqual(1);
            expect(res.body[0].type).toEqual('Unassigned');
            expect(res.body[0].name).toEqual('New Unknown Device');
        });
    });
});
