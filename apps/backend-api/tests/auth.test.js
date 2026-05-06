const request = require('supertest');
const app = require('../src/app'); // Import the express app
const User = require('../src/models/User');

describe('Authentication Endpoints', () => {
    // Let's create a test user before each test if needed
    let testUser;
    
    beforeEach(async () => {
        // Create a fake homeowner user for testing
        testUser = await User.create({
            fullName: 'Test Homeowner',
            email: 'test@bieon.com',
            password: 'password123',
            role: 'Homeowner',
            phoneNumber: '+6281234567890'
        });
    });

    it('should login successfully and return a JWT token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@bieon.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.fullName).toEqual('Test Homeowner');
    });

    it('should reject login with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@bieon.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(400); // Usually 400 or 401
        expect(res.body).toHaveProperty('message', 'Password salah!');
    });

    it('should deny access to protected route without token', async () => {
        // Let's try to access a protected route, e.g., getting homeowner settings
        const res = await request(app)
            .get('/api/auth/me');

        expect(res.statusCode).toEqual(401);
    });
});
