const User = require('../../models/User');
const Hub = require('../../models/Hub');
const Device = require('../../models/Device');

const ROLE_HOMEOWNER = 'Homeowner';

const toPublicHomeowner = (userDoc, totalHubs = 0) => ({
    _id: userDoc._id,
    role: userDoc.role,
    fullName: userDoc.fullName,
    username: userDoc.username || '',
    email: userDoc.email,
    phoneNumber: userDoc.phoneNumber || '',
    address: userDoc.address || '',
    systemName: userDoc.systemName || '',
    plnTariff: userDoc.plnTariff || '',
    bieonId: userDoc.bieonId || '',
    status: userDoc.status || 'aktif',
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
    totalHubs,
});

const ensureValidation = (payload, { isCreate = false } = {}) => {
    const requiredFields = ['fullName', 'email'];

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
        const error = new Error('Status homeowner tidak valid. Gunakan aktif atau nonaktif.');
        error.status = 400;
        throw error;
    }

    if (payload.password && String(payload.password).length < 8) {
        const error = new Error('Password minimal 8 karakter.');
        error.status = 400;
        throw error;
    }
};

const normalizePayload = (payload) => ({
    fullName: payload.fullName?.trim(),
    username: payload.username?.trim(),
    email: payload.email?.trim().toLowerCase(),
    password: payload.password,
    phoneNumber: payload.phoneNumber?.trim(),
    address: payload.address?.trim(),
    systemName: payload.systemName?.trim(),
    plnTariff: payload.plnTariff?.trim(),
    bieonId: payload.bieonId?.trim(),
    status: payload.status || 'aktif',
});

exports.createHomeowner = async (payload) => {
    const normalized = normalizePayload(payload);
    ensureValidation(normalized, { isCreate: true });

    const duplicateEmail = await User.findOne({ email: normalized.email }).lean();
    if (duplicateEmail) {
        const error = new Error('Email sudah digunakan.');
        error.status = 409;
        throw error;
    }

    const homeowner = new User({
        ...normalized,
        role: ROLE_HOMEOWNER,
    });

    const saved = await homeowner.save();
    return toPublicHomeowner(saved.toObject());
};

exports.getHomeownerById = async (id) => {
    const homeowner = await User.findOne({ _id: id, role: ROLE_HOMEOWNER }).select('-password').lean();

    if (!homeowner) {
        const error = new Error('Homeowner tidak ditemukan.');
        error.status = 404;
        throw error;
    }

    const hubCount = await Hub.countDocuments({ owner: id });
    return toPublicHomeowner(homeowner, hubCount);
};

exports.updateHomeowner = async (id, payload) => {
    const homeowner = await User.findOne({ _id: id, role: ROLE_HOMEOWNER });

    if (!homeowner) {
        const error = new Error('Homeowner tidak ditemukan.');
        error.status = 404;
        throw error;
    }

    const normalized = normalizePayload(payload);
    ensureValidation({ ...homeowner.toObject(), ...normalized }, { isCreate: false });

    if (normalized.email && normalized.email !== homeowner.email) {
        const duplicateEmail = await User.findOne({ email: normalized.email, _id: { $ne: id } }).lean();
        if (duplicateEmail) {
            const error = new Error('Email sudah digunakan.');
            error.status = 409;
            throw error;
        }
    }

    const allowedFields = [
        'fullName',
        'username',
        'email',
        'phoneNumber',
        'address',
        'systemName',
        'plnTariff',
        'bieonId',
        'status',
    ];

    for (const key of allowedFields) {
        if (normalized[key] !== undefined) {
            homeowner[key] = normalized[key];
        }
    }

    if (normalized.password) {
        homeowner.password = normalized.password;
    }

    const updated = await homeowner.save();
    const hubCount = await Hub.countDocuments({ owner: id });
    return toPublicHomeowner(updated.toObject(), hubCount);
};

exports.getHomeownerStats = async (id) => {
    const homeowner = await User.findOne({ _id: id, role: ROLE_HOMEOWNER }).select('_id').lean();
    if (!homeowner) {
        const error = new Error('Homeowner tidak ditemukan.');
        error.status = 404;
        throw error;
    }

    const hubs = await Hub.find({ owner: id }).select('_id').lean();
    
    // Asumsikan Device terikat ke owner di model Device
    let totalDevices = 0;
    if (Device) {
        totalDevices = await Device.countDocuments({ owner: id });
    }

    return {
        totalHubs: hubs.length,
        totalDevices
    };
};
