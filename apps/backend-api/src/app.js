const express = require("express");
const cors = require("cors");
const app = express();

// Import Routes
const authRoutes = require("./routes/authRoutes");
const hubRoutes = require("./routes/hubRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const kendaliPerangkatRoutes = require("./routes/kendaliPerangkatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const technicianRoutes = require('./routes/technicianRoutes');
const technicianAccessRoutes = require("./routes/technicianAccessRoutes");
const technicianDashboardRoutes = require("./routes/technicianDashboardRoutes");
const plnTariffRoutes = require("./routes/plnTariffRoutes");
const historyRoutes = require("./routes/historyRoutes");
const productRoutes = require("./routes/productRoutes");

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
app.use('/api/admin', adminRoutes);
app.use('/api/technician', technicianRoutes);
app.use('/api/technician-access', technicianAccessRoutes);
app.use('/api/technician/dashboard', technicianDashboardRoutes);
app.use('/api/admin/tariffs', plnTariffRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/products', productRoutes);

module.exports = app;