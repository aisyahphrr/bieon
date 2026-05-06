const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/bieon').then(async () => {
    const db = mongoose.connection.db;
    const SensorData = db.collection('sensordatas');
    const ph = await SensorData.findOne({ topic: { $regex: /\/ph$/i } }, { sort: { timestamp: -1 } });
    console.log('PH:', ph);
    const turb = await SensorData.findOne({ topic: { $regex: /\/turbidity$/i } }, { sort: { timestamp: -1 } });
    console.log('TURB:', turb);
    mongoose.disconnect();
});
