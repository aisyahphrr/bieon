const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// URI MongoDB
const MONGO_URI = 'mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => console.log('API Services terhubung ke MongoDB!'))
    .catch(err => console.error('Gagal konek MongoDB:', err));

// Schema
const SensorSchema = new mongoose.Schema({ topic: String, value: Number, timestamp: Date });
const SensorData = mongoose.model('SensorData', SensorSchema);

// Endpoint API dengan Pelacak
app.get('/api/sensors/suhu', async (req, res) => {
    console.log("Request diterima oleh server!"); // <--- PELACAK INI PENTING
    try {
        const data = await SensorData.find({ topic: "bieon/sensor_01/suhu" })
            .sort({ timestamp: -1 })
            .limit(1);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5005, () => console.log('API Services jalan di port 5005'));