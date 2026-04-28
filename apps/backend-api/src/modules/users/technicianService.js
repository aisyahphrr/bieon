const User = require('../../models/User');
const accountDeletionService = require('../admin/accountDeletionService');

const ROLE_TECHNICIAN = 'Technician';

const normalizeWorkSchedule = (workSchedule) => {
    if (!workSchedule) return {};
    if (workSchedule instanceof Map) {
        return Object.fromEntries(workSchedule.entries());
    }
    if (typeof workSchedule === 'object') {
        return workSchedule;
    }
    return {};
};

const normalizeCurrentLocation = (currentLocation) => {
    if (
        !currentLocation ||
        typeof currentLocation.lat !== 'number' ||
        Number.isNaN(currentLocation.lat) ||
        typeof currentLocation.lng !== 'number' ||
        Number.isNaN(currentLocation.lng)
    ) {
        return null;
    }

    return {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        accuracy: typeof currentLocation.accuracy === 'number' ? currentLocation.accuracy : null,
        source: currentLocation.source || 'browser',
        capturedAt: currentLocation.capturedAt || null,
        label: currentLocation.label || '',
    };
};

const toPublicTechnician = (userDoc) => ({
    _id: userDoc._id,
    technicianId: userDoc.technicianId || '-',
    role: userDoc.role,
    fullName: userDoc.fullName,
    email: userDoc.email,
    phoneNumber: userDoc.phoneNumber || '',
    address: userDoc.address || '',
    position: userDoc.position || 'Senior Technician',
    experience: userDoc.experience || 0,
    specializations: Array.isArray(userDoc.specializations) ? userDoc.specializations : [],
    workArea: userDoc.workArea || '',
    coverageAreas: Array.isArray(userDoc.coverageAreas) ? userDoc.coverageAreas : [],
    workSchedule: normalizeWorkSchedule(userDoc.workSchedule),
    currentLocation: normalizeCurrentLocation(userDoc.currentLocation),
    status: userDoc.status || 'aktif',
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
});

const ensureValidation = (payload, { isCreate = false } = {}) => {
    const requiredFields = ['fullName', 'email', 'phoneNumber', 'address', 'position', 'workArea'];

    if (isCreate) {
        requiredFields.push('password');
    }

    for (const field of requiredFields) {
        if (!payload[field] || String(payload[field]).trim() === '') {
            const error = new Error(`Field ${field} wajib diisi.`);
            error.status = 400;
            throw error;
        }
    }

    if (payload.status && !['aktif', 'nonaktif'].includes(payload.status)) {
        const error = new Error('Status teknisi tidak valid. Gunakan aktif atau nonaktif.');
        error.status = 400;
        throw error;
    }

    if (payload.password && String(payload.password).length < 8) {
        const error = new Error('Password minimal 8 karakter.');
        error.status = 400;
        throw error;
    }

    if (payload.experience !== undefined && Number(payload.experience) < 0) {
        const error = new Error('Pengalaman tidak boleh kurang dari 0.');
        error.status = 400;
        throw error;
    }

    if (payload.specializations && !Array.isArray(payload.specializations)) {
        const error = new Error('specializations harus berupa array.');
        error.status = 400;
        throw error;
    }

    if (payload.coverageAreas && !Array.isArray(payload.coverageAreas)) {
        const error = new Error('coverageAreas harus berupa array.');
        error.status = 400;
        throw error;
    }

    if (payload.workSchedule && typeof payload.workSchedule !== 'object') {
        const error = new Error('workSchedule harus berupa object.');
        error.status = 400;
        throw error;
    }
};

const normalizePayload = (payload) => ({
    fullName: payload.fullName?.trim(),
    email: payload.email?.trim().toLowerCase(),
    password: payload.password,
    phoneNumber: payload.phoneNumber?.trim(),
    address: payload.address?.trim(),
    position: payload.position?.trim(),
    experience: payload.experience !== undefined ? Number(payload.experience) : undefined,
    specializations: Array.isArray(payload.specializations) ? payload.specializations : [],
    workArea: payload.workArea?.trim(),
    coverageAreas: Array.isArray(payload.coverageAreas) ? payload.coverageAreas : [],
    workSchedule: payload.workSchedule || {},
    status: payload.status || 'aktif',
});

const generateNextTechnicianId = async () => {
    const technicians = await User.find({
        role: ROLE_TECHNICIAN,
        technicianId: { $regex: /^TECH\d+$/ }
    }).select('technicianId').lean();

    const maxId = technicians.reduce((max, tech) => {
        const numericPart = Number(String(tech.technicianId).replace('TECH', ''));
        return Number.isFinite(numericPart) && numericPart > max ? numericPart : max;
    }, 0);

    return `TECH${String(maxId + 1).padStart(3, '0')}`;
};

exports.createTechnician = async (payload) => {
    const normalized = normalizePayload(payload);
    ensureValidation(normalized, { isCreate: true });

    const duplicateEmail = await User.findOne({ email: normalized.email }).lean();
    if (duplicateEmail) {
        const error = new Error('Email sudah digunakan.');
        error.status = 409;
        throw error;
    }

    const technicianId = await generateNextTechnicianId();

    const technician = new User({
        ...normalized,
        role: ROLE_TECHNICIAN,
        technicianId,
    });

    const saved = await technician.save();
    return toPublicTechnician(saved.toObject());
};

exports.listTechnicians = async (query = {}) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = { role: ROLE_TECHNICIAN };

    if (query.status && ['aktif', 'nonaktif'].includes(query.status)) {
        filter.status = query.status;
    }

    if (query.workArea) {
        filter.workArea = query.workArea;
    }

    if (query.search) {
        const searchRegex = new RegExp(query.search, 'i');
        filter.$or = [
            { fullName: searchRegex },
            { email: searchRegex },
            { technicianId: searchRegex },
            { workArea: searchRegex },
        ];
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [rows, total] = await Promise.all([
        User.find(filter)
            .select('-password')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(filter)
    ]);

    const publicData = rows.map(toPublicTechnician);

    const dataWithClientsCount = await Promise.all(publicData.map(async (tech) => {
        const count = await User.countDocuments({ assignedTechnician: tech._id, role: 'Homeowner' });
        return { ...tech, clientsCount: count };
    }));

    const dataWithDeletionStatus = await accountDeletionService.attachLatestDeletionRequestSummary(dataWithClientsCount);

    return {
        data: dataWithDeletionStatus,
        total,
        page,
        limit,
    };
};

exports.getTechnicianById = async (id) => {
    const tech = await User.findOne({ _id: id, role: ROLE_TECHNICIAN }).select('-password').lean();

    if (!tech) {
        const error = new Error('Teknisi tidak ditemukan.');
        error.status = 404;
        throw error;
    }

    const publicTech = toPublicTechnician(tech);

    // Ambil data pelanggan (Homeowners) yang ditugaskan ke teknisi ini
    const clients = await User.find({ assignedTechnician: id, role: 'Homeowner' }).select('fullName address').lean();
    
    // Pastikan Hub dan Device bisa digunakan
    const Hub = require('../../models/Hub');
    const Device = require('../../models/Device');

    const formattedClients = await Promise.all(clients.map(async (client) => {
        const hubCount = await Hub.countDocuments({ owner: client._id });
        const deviceCount = await Device.countDocuments({ owner: client._id });
        
        return {
            id: client._id,
            name: client.fullName,
            location: client.address || 'Alamat tidak tersedia',
            bieonDevices: hubCount,
            smartDevices: deviceCount,
            status: 'online' // TODO: implement real status logic based on hubs
        };
    }));

    publicTech.clients = formattedClients;

    const [withDeletionStatus] = await accountDeletionService.attachLatestDeletionRequestSummary([publicTech]);
    return withDeletionStatus;
};

exports.updateTechnician = async (id, payload) => {
    const technician = await User.findOne({ _id: id, role: ROLE_TECHNICIAN });

    if (!technician) {
        const error = new Error('Teknisi tidak ditemukan.');
        error.status = 404;
        throw error;
    }

    const normalized = normalizePayload(payload);

    // update tidak mewajibkan password
    ensureValidation({ ...technician.toObject(), ...normalized }, { isCreate: false });

    if (normalized.email && normalized.email !== technician.email) {
        const duplicateEmail = await User.findOne({ email: normalized.email, _id: { $ne: id } }).lean();
        if (duplicateEmail) {
            const error = new Error('Email sudah digunakan.');
            error.status = 409;
            throw error;
        }
    }

    const allowedFields = [
        'fullName',
        'email',
        'phoneNumber',
        'address',
        'position',
        'experience',
        'specializations',
        'workArea',
        'coverageAreas',
        'workSchedule',
        'status',
    ];

    for (const key of allowedFields) {
        if (normalized[key] !== undefined) {
            technician[key] = normalized[key];
        }
    }

    if (normalized.password) {
        technician.password = normalized.password;
    }

    const updated = await technician.save();
    return toPublicTechnician(updated.toObject());
};

exports.updateTechnicianLocation = async (id, payload) => {
    const technician = await User.findOne({ _id: id, role: ROLE_TECHNICIAN });

    if (!technician) {
        const error = new Error('Teknisi tidak ditemukan.');
        error.status = 404;
        throw error;
    }

    const lat = Number(payload?.lat);
    const lng = Number(payload?.lng);
    const accuracy = payload?.accuracy !== undefined ? Number(payload.accuracy) : null;

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        const error = new Error('Latitude tidak valid.');
        error.status = 400;
        throw error;
    }

    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        const error = new Error('Longitude tidak valid.');
        error.status = 400;
        throw error;
    }

    technician.currentLocation = {
        lat,
        lng,
        accuracy: Number.isFinite(accuracy) ? accuracy : undefined,
        source: payload?.source || 'browser',
        capturedAt: payload?.capturedAt ? new Date(payload.capturedAt) : new Date(),
        label: payload?.label ? String(payload.label).trim() : undefined,
    };

    const updated = await technician.save();
    return toPublicTechnician(updated.toObject());
};

exports.listTechnicianLocations = async () => {
    const rows = await User.find({ role: ROLE_TECHNICIAN })
        .select('-password')
        .sort({ fullName: 1 })
        .lean();

    const publicData = rows.map(toPublicTechnician);

    const dataWithCounts = await Promise.all(publicData.map(async (tech) => {
        const clientsCount = await User.countDocuments({ assignedTechnician: tech._id, role: 'Homeowner' });

        return {
            ...tech,
            clientsCount,
            hasLiveLocation: Boolean(tech.currentLocation),
        };
    }));

    return accountDeletionService.attachLatestDeletionRequestSummary(dataWithCounts);
};

exports.deleteTechnician = async (id) => {
    const tech = await User.findOne({ _id: id, role: ROLE_TECHNICIAN }).lean();

    if (!tech) {
        const error = new Error('Teknisi tidak ditemukan.');
        error.status = 404;
        throw error;
    }

    await User.deleteOne({ _id: id, role: ROLE_TECHNICIAN });

    return {
        _id: tech._id,
        technicianId: tech.technicianId,
        fullName: tech.fullName,
        email: tech.email,
    };
};
