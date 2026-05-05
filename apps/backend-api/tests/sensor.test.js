const request = require('supertest');
const app = require('../src/app');
const SensorData = require('../src/models/SensorData');

describe('Sensor Endpoints (Public - No Auth Required)', () => {

    describe('GET /api/sensors/suhu', () => {
        it('should return null value when no sensor data exists', async () => {
            const res = await request(app).get('/api/sensors/suhu');

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0]).toHaveProperty('value', null);
        });

        it('should return the latest temperature value when data exists', async () => {
            await SensorData.create({
                topic: 'bieon/sensor/suhu',
                value: 28.5,
                timestamp: new Date()
            });

            const res = await request(app).get('/api/sensors/suhu');

            expect(res.statusCode).toEqual(200);
            expect(res.body[0].value).toEqual(28.5);
        });

        it('should return the MOST RECENT value when multiple entries exist', async () => {
            await SensorData.create([
                { topic: 'bieon/sensor/suhu', value: 24.0, timestamp: new Date(Date.now() - 10000) },
                { topic: 'bieon/sensor/suhu', value: 30.0, timestamp: new Date() } // newest
            ]);

            const res = await request(app).get('/api/sensors/suhu');

            expect(res.statusCode).toEqual(200);
            expect(res.body[0].value).toEqual(30.0);
        });
    });

    describe('GET /api/sensors/kelembapan', () => {
        it('should return null value when no data exists', async () => {
            const res = await request(app).get('/api/sensors/kelembapan');

            expect(res.statusCode).toEqual(200);
            expect(res.body[0].value).toBeNull();
        });

        it('should return the latest humidity value', async () => {
            await SensorData.create({
                topic: 'bieon/sensor/kelembapan',
                value: 65,
                timestamp: new Date()
            });

            const res = await request(app).get('/api/sensors/kelembapan');

            expect(res.statusCode).toEqual(200);
            expect(res.body[0].value).toEqual(65);
        });
    });

    describe('GET /api/sensors/ph', () => {
        it('should return null when no pH data exists', async () => {
            const res = await request(app).get('/api/sensors/ph');

            expect(res.statusCode).toEqual(200);
            expect(res.body[0].value).toBeNull();
        });

        it('should return the latest pH value', async () => {
            await SensorData.create({
                topic: 'bieon/sensor/ph',
                value: 7.2,
                timestamp: new Date()
            });

            const res = await request(app).get('/api/sensors/ph');

            expect(res.statusCode).toEqual(200);
            expect(res.body[0].value).toEqual(7.2);
        });
    });

    describe('GET /api/sensors/tds', () => {
        it('should return null when no TDS data exists', async () => {
            const res = await request(app).get('/api/sensors/tds');

            expect(res.statusCode).toEqual(200);
            expect(res.body[0].value).toBeNull();
        });

        it('should return the latest TDS value', async () => {
            await SensorData.create({
                topic: 'bieon/sensor/tds',
                value: 350,
                timestamp: new Date()
            });

            const res = await request(app).get('/api/sensors/tds');

            expect(res.statusCode).toEqual(200);
            expect(res.body[0].value).toEqual(350);
        });
    });

    describe('GET /api/sensors/turbidity', () => {
        it('should return null when no turbidity data exists', async () => {
            const res = await request(app).get('/api/sensors/turbidity');

            expect(res.statusCode).toEqual(200);
            expect(res.body[0].value).toBeNull();
        });

        it('should return the latest turbidity value', async () => {
            await SensorData.create({
                topic: 'bieon/sensor/turbidity',
                value: 12.5,
                timestamp: new Date()
            });

            const res = await request(app).get('/api/sensors/turbidity');

            expect(res.statusCode).toEqual(200);
            expect(res.body[0].value).toEqual(12.5);
        });
    });
});
