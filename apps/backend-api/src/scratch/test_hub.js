const mongoose = require('mongoose');
const User = require('../models/User');
const BieonSystem = require('../models/BieonSystem');
const Hub = require('../models/Hub');
const KendaliPerangkat = require('../models/KendaliPerangkat');
const hubController = require('../controllers/hubController');

require('dotenv').config({ path: '../../.env' });

async function testSetupHubs() {
  let connection;
  try {
    const uri = process.env.MONGODB_URI || "mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?appName=Cluster0";
    connection = await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const testBieonId = 'bieon_test_001';

    // 1. Create a fake user, save it, then create system, then delete user
    const fakeUserId = new mongoose.Types.ObjectId();
    const newSystem = new BieonSystem({ bieonId: testBieonId, owner: fakeUserId, hubCount: 1 });
    await BieonSystem.deleteOne({ bieonId: testBieonId }); // clean up before
    await newSystem.save();

    console.log("Created orphaned system.");

    // 2. Create another valid user to be the new owner
    const validUser = new User({
        email: `test_owner_${Date.now()}@example.com`,
        password: 'password123',
        fullName: 'Test Owner',
        role: 'Homeowner'
    });
    await validUser.save();
    console.log("Created valid new owner.");

    // 3. Mock req and res for setupHubs
    const req = {
        body: {
            bieonId: testBieonId,
            totalHubs: 2,
            userId: validUser._id
        }
    };
    const res = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            console.log(`Response Status: ${this.statusCode}`);
            console.log(`Response Data:`, data);
        }
    };

    // 4. Run setupHubs
    console.log("Running setupHubs...");
    await hubController.setupHubs(req, res);

    // 5. Cleanup
    await BieonSystem.deleteOne({ bieonId: testBieonId });
    await Hub.deleteMany({ bieonId: testBieonId });
    await User.deleteOne({ _id: validUser._id });
    console.log("Test finished and cleaned up.");

  } catch (error) {
    console.error("Test error:", error);
  } finally {
    if (connection) {
        mongoose.disconnect();
    }
  }
}

testSetupHubs();
