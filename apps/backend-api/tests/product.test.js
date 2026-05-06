const request = require('supertest');
const app = require('../src/app');
const RegisteredProduct = require('../src/models/RegisteredProduct');

describe('Product Endpoints', () => {
    beforeEach(async () => {
        // Seed a product for testing
        await RegisteredProduct.create({
            productId: 'BIEON-SENSOR-001',
            productName: 'Smart Temperature Sensor',
            category: 'sensor',   // enum: 'sensor' | 'control' (lowercase)
            aspect: 'kenyamanan'  // enum: 'kenyamanan' | 'air' | ... (lowercase)
        });
    });

    describe('POST /api/products/register', () => {
        it('should register a new product successfully', async () => {
            const res = await request(app)
                .post('/api/products/register')
                .send({
                    productId: 'BIEON-PLUG-001',
                    productName: 'Smart Plug',
                    category: 'control',   // lowercase enum
                    aspect: 'smart-plug'   // lowercase enum
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'Registrasi Produk Berhasil!');
            expect(res.body.product.productId).toEqual('BIEON-PLUG-001');

            // Verify in DB
            const dbProduct = await RegisteredProduct.findOne({ productId: 'BIEON-PLUG-001' });
            expect(dbProduct).toBeTruthy();
            expect(dbProduct.productName).toEqual('Smart Plug');
        });

        it('should return 400 if productId already registered', async () => {
            const res = await request(app)
                .post('/api/products/register')
                .send({
                    productId: 'BIEON-SENSOR-001', // already exists
                    productName: 'Duplicate Sensor',
                    category: 'Sensor'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'ID Produk sudah terdaftar di sistem.');
        });
    });

    describe('GET /api/products/list', () => {
        it('should return list of available (unused) products', async () => {
            const res = await request(app).get('/api/products/list');

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            expect(res.body[0]).toHaveProperty('productId');
        });

        it('should not return products that are already in use (isUsed: true)', async () => {
            // Mark product as used
            await RegisteredProduct.findOneAndUpdate(
                { productId: 'BIEON-SENSOR-001' },
                { isUsed: true }
            );

            const res = await request(app).get('/api/products/list');
            const usedProduct = res.body.find(p => p.productId === 'BIEON-SENSOR-001');
            expect(usedProduct).toBeUndefined();
        });
    });

    describe('GET /api/products/validate/:id', () => {
        it('should return isValid: true for a registered product', async () => {
            const res = await request(app)
                .get('/api/products/validate/BIEON-SENSOR-001');

            expect(res.statusCode).toEqual(200);
            expect(res.body.isValid).toBe(true);
            expect(res.body.productName).toEqual('Smart Temperature Sensor');
        });

        it('should return 404 and isValid: false for unknown product ID', async () => {
            const res = await request(app)
                .get('/api/products/validate/INVALID-ID-999');

            expect(res.statusCode).toEqual(404);
            expect(res.body.isValid).toBe(false);
        });
    });
});
