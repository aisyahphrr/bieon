const express = require("express");
const cors = require("cors");
const app = express();

// Import Routes
const authRoutes = require("./routes/authRoutes");
const hubRoutes = require("./routes/hubRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const kendaliPerangkatRoutes = require("./routes/kendaliPerangkatRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// Route dasar
app.get('/api', (req, res) => {
    res.json({ message: 'BIEON Backend API beroperasi 🚀' });
});

// --- DAFTARKAN ROUTE DI SINI ---
app.use('/api/auth', authRoutes);
app.use('/api/hubs', hubRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/kendaliperangkat', kendaliPerangkatRoutes);

module.exports = app;