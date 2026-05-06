const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
    // Setup In-Memory Database
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Connect Mongoose to the in-memory DB
    await mongoose.connect(uri);
});

afterAll(async () => {
    // Disconnect and stop the in-memory DB
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // Clean up all collections after each test to ensure test isolation
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});
