const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');

// GET /api/sensors/suhu
// Mengambil data suhu terakhir dari database sensordatas
router.get('/suhu', async (req, res) => {
    try {
        // Cari data terbaru yang topic-nya berakhiran dengan /suhu
        const latestSuhu = await SensorData.findOne({ topic: { $regex: /\/suhu$/i } })
            .sort({ timestamp: -1 });
            
        if (latestSuhu) {
            res.json([{ value: latestSuhu.value }]);
        } else {
            res.json([{ value: null }]);
        }
    } catch (err) {
        console.error("Error fetching latest suhu:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /api/sensors/kelembapan
// Mengambil data kelembapan terakhir dari database sensordatas
router.get('/kelembapan', async (req, res) => {
    try {
        const latestKelembapan = await SensorData.findOne({ topic: { $regex: /\/kelembapan$/i } })
            .sort({ timestamp: -1 });
            
        if (latestKelembapan) {
            res.json([{ value: latestKelembapan.value }]);
        } else {
            res.json([{ value: null }]);
        }
    } catch (err) {
        console.error("Error fetching latest kelembapan:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /api/sensors/ph
router.get('/ph', async (req, res) => {
    try {
        const latestData = await SensorData.findOne({ topic: { $regex: /\/ph$/i } }).sort({ timestamp: -1 });
        res.json([{ value: latestData ? latestData.value : null }]);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /api/sensors/tds
router.get('/tds', async (req, res) => {
    try {
        const latestData = await SensorData.findOne({ topic: { $regex: /\/tds$/i } }).sort({ timestamp: -1 });
        res.json([{ value: latestData ? latestData.value : null }]);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// GET /api/sensors/turbidity
router.get('/turbidity', async (req, res) => {
    try {
        const latestData = await SensorData.findOne({ topic: { $regex: /\/turbidity$/i } }).sort({ timestamp: -1 });
        res.json([{ value: latestData ? latestData.value : null }]);
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
