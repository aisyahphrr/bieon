const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
    try {
        const { title, room, desc, userId } = req.body;
        const newComplaint = new Complaint({ title, room, desc, homeowner: userId });
        await newComplaint.save();
        res.status(201).json({ message: 'Tiket pengaduan berhasil dibuat!', complaint: newComplaint });
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat pengaduan', error: error.message });
    }
};

exports.getComplaintsByOwner = async (req, res) => {
    try {
        const complaints = await Complaint.find({ homeowner: req.params.userId });
        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pengaduan', error: error.message });
    }
};
