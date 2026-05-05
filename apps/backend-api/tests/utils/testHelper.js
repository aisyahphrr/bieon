const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/User');

/**
 * Creates a mock user in the test database.
 * @param {Object} overrides - Any user fields to override
 * @returns {Object} The created user document
 */
const createTestUser = async (overrides = {}) => {
    const defaultUser = {
        fullName: 'Test Homeowner',
        email: `test_${Date.now()}@bieon.com`,
        password: 'password123',
        role: 'Homeowner',
        phoneNumber: '+6281234567890'
    };

    const userData = { ...defaultUser, ...overrides };
    return await User.create(userData);
};

/**
 * Generates a valid JWT token for testing.
 * @param {string} userId - The mongoose ObjectId string
 * @param {string} role - User role (e.g., 'Homeowner', 'Technician', 'SuperAdmin')
 * @returns {string} The JWT token
 */
const generateTestToken = (userId, role = 'Homeowner') => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || 'rahasia_cadangan',
        { expiresIn: '1d' }
    );
};

module.exports = {
    createTestUser,
    generateTestToken
};
