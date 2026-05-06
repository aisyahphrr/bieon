const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply authMiddleware to all sensor routes
router.use(authMiddleware);

// GET /api/sensors/suhu
router.get('/suhu', async (req, res) => {
    try {
        const bieonId = req.user.bieonId;
        if (!bieonId) return res.json([{ value: null }]);

        // Cari data terbaru yang topic-nya mengandung bieonId dan berakhiran dengan /suhu
        const latestSuhu = await SensorData.findOne({ 
            topic: { $regex: new RegExp(`${bieonId}/.*suhu$`, 'i') }
        }).sort({ timestamp: -1 });
            
        res.json([{ value: latestSuhu ? latestSuhu.value : null }]);
    } catch (err) {
        console.error("Error fetching latest suhu:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /api/sensors/suhu-air (Water Temperature)
router.get('/suhu-air', async (req, res) => {
    try {
        const latestData = await SensorData.findOne({ topic: { $regex: /sensor_air_01\/suhu$/i } }).sort({ timestamp: -1 });
        res.json([{ value: latestData ? latestData.value : null }]);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /api/sensors/kelembapan
router.get('/kelembapan', async (req, res) => {
    try {
        const bieonId = req.user.bieonId;
        if (!bieonId) return res.json([{ value: null }]);

        const latestKelembapan = await SensorData.findOne({ 
            topic: { $regex: new RegExp(`${bieonId}/.*kelembapan$`, 'i') } 
        }).sort({ timestamp: -1 });
            
        res.json([{ value: latestKelembapan ? latestKelembapan.value : null }]);
    } catch (err) {
        console.error("Error fetching latest kelembapan:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /api/sensors/ph
router.get('/ph', async (req, res) => {
    try {
        const bieonId = req.user.bieonId;
        if (!bieonId) return res.json([{ value: null }]);

        const latestData = await SensorData.findOne({ 
            topic: { $regex: new RegExp(`${bieonId}/.*ph$`, 'i') } 
        }).sort({ timestamp: -1 });
        res.json([{ value: latestData ? latestData.value : null }]);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /api/sensors/tds
router.get('/tds', async (req, res) => {
    try {
        const bieonId = req.user.bieonId;
        if (!bieonId) return res.json([{ value: null }]);

        const latestData = await SensorData.findOne({ 
            topic: { $regex: new RegExp(`${bieonId}/.*tds$`, 'i') } 
        }).sort({ timestamp: -1 });
        res.json([{ value: latestData ? latestData.value : null }]);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /api/sensors/turbidity
router.get('/turbidity', async (req, res) => {
    try {
        const bieonId = req.user.bieonId;
        if (!bieonId) return res.json([{ value: null }]);

        const latestData = await SensorData.findOne({ 
            topic: { $regex: new RegExp(`${bieonId}/.*turbidity$`, 'i') } 
        }).sort({ timestamp: -1 });
        res.json([{ value: latestData ? latestData.value : null }]);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
