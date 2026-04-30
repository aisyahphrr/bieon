const crypto = require('crypto');
const AccountDeletionRequest = require('../../models/AccountDeletionRequest');
const User = require('../../models/User');
const Hub = require('../../models/Hub');
const Device = require('../../models/Device');
const Complaint = require('../../models/Complaint');
const { sendMail } = require('../../services/mailService');
const {
    renderProjectOwnerApprovalEmail,
    renderRequesterDecisionEmail,
    renderTargetDeletedEmail,
} = require('../../services/deletionEmailTemplates');

const PROJECT_OWNER_EMAIL = (process.env.PROJECT_OWNER_EMAIL || 'aisyahputriharmelia@gmail.com').trim().toLowerCase();
const FRONTEND_BASE_URL = (process.env.FRONTEND_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

const buildTargetSnapshot = (user) => ({
    fullName: user.fullName || '-',
    email: user.email || '-',
    username: user.username || '',
    technicianId: user.technicianId || '',
    bieonId: user.bieonId || '',
    phoneNumber: user.phoneNumber || '',
    address: user.address || '',
    workArea: user.workArea || '',
    position: user.position || '',
    status: user.status || '',
});

const buildRequesterSnapshot = (user) => ({
    fullName: user.fullName || '-',
    email: user.email || '-',
    role: user.role || '-',
});

const toPublicSummary = (request) => ({
    _id: request._id,
    targetUser: request.targetUser,
    targetRole: request.targetRole,
    reason: request.reason,
    status: request.status,
    decisionNote: request.decisionNote || '',
    projectOwnerEmail: request.projectOwnerEmail,
    targetSnapshot: request.targetSnapshot,
    requestedBySnapshot: request.requestedBySnapshot,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    decidedAt: request.decidedAt,
});

const getRequestUrls = (token) => ({
    approveUrl: `${FRONTEND_BASE_URL}/delete-approval?token=${encodeURIComponent(token)}&action=approve`,
    rejectUrl: `${FRONTEND_BASE_URL}/delete-approval?token=${encodeURIComponent(token)}&action=reject`,
});

const ensureDeleteTarget = async (targetUserId, expectedRole) => {
    const user = await User.findById(targetUserId);

    if (!user) {
        const error = new Error('Akun target tidak ditemukan.');
        error.status = 404;
        throw error;
    }

    if (user.role !== expectedRole) {
        const error = new Error(`Akun ini bukan role ${expectedRole}.`);
        error.status = 400;
        throw error;
    }

    return user;
};

const ensureRequester = async (requestedByUserId) => {
    const requester = await User.findById(requestedByUserId);

    if (!requester) {
        const error = new Error('Super Admin pengaju tidak ditemukan.');
        error.status = 404;
        throw error;
    }

    return requester;
};

const executeApprovedDeletion = async (request) => {
    const targetUserId = request.targetUser;
    const targetRole = request.targetRole;

    if (targetRole === 'Homeowner') {
        await Device.deleteMany({ owner: targetUserId });
        await Hub.deleteMany({ owner: targetUserId });
        await User.deleteOne({ _id: targetUserId, role: 'Homeowner' });
        return;
    }

    if (targetRole === 'Technician') {
        await User.updateMany(
            { assignedTechnician: targetUserId, role: 'Homeowner' },
            { $set: { assignedTechnician: null } }
        );
        await Complaint.updateMany(
            { technician: targetUserId },
            { $set: { technician: null, status: 'unassigned' } }
        );
        await User.deleteOne({ _id: targetUserId, role: 'Technician' });
    }
};

const sendApprovalRequestEmail = async (request, token) => {
    const { approveUrl, rejectUrl } = getRequestUrls(token);
    const emailContent = renderProjectOwnerApprovalEmail({ request, approveUrl, rejectUrl });

    return sendMail({
        to: request.projectOwnerEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        transport: 'gmail',
    });
};

const sendRequesterDecisionEmail = async (request) => {
    const emailContent = renderRequesterDecisionEmail({ request });
    const result = await sendMail({
        to: request.requestedBySnapshot.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        transport: 'gmail',
    });

    if (result.sent) {
        request.requesterNotifiedAt = new Date();
        await request.save();
    }

    return result;
};

const sendTargetDeletedEmail = async (request) => {
    const emailContent = renderTargetDeletedEmail({ request });
    const result = await sendMail({
        to: request.targetSnapshot.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        transport: 'gmail',
    });

    if (result.sent) {
        request.targetNotifiedAt = new Date();
        await request.save();
    }

    return result;
};

exports.createDeletionRequest = async ({ targetUserId, targetRole, reason, requestedByUserId }) => {
    const normalizedReason = String(reason || '').trim();

    if (!normalizedReason) {
        const error = new Error('Alasan penghapusan wajib diisi.');
        error.status = 400;
        throw error;
    }

    const [targetUser, requester] = await Promise.all([
        ensureDeleteTarget(targetUserId, targetRole),
        ensureRequester(requestedByUserId),
    ]);

    const existingPending = await AccountDeletionRequest.findOne({
        targetUser: targetUser._id,
        status: 'pending',
    }).sort({ createdAt: -1 });

    if (existingPending) {
        const error = new Error('Sudah ada permintaan penghapusan yang masih menunggu persetujuan untuk akun ini.');
        error.status = 409;
        error.payload = toPublicSummary(existingPending);
        throw error;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const request = await AccountDeletionRequest.create({
        targetUser: targetUser._id,
        targetRole,
        targetSnapshot: buildTargetSnapshot(targetUser),
        requestedBy: requester._id,
        requestedBySnapshot: buildRequesterSnapshot(requester),
        reason: normalizedReason,
        status: 'pending',
        decisionTokenHash: hashToken(token),
        projectOwnerEmail: PROJECT_OWNER_EMAIL,
    });

    const emailResult = await sendApprovalRequestEmail(request, token);

    return {
        request: toPublicSummary(request),
        emailResult,
    };
};

exports.getRequestByToken = async (token) => {
    const request = await AccountDeletionRequest.findOne({ decisionTokenHash: hashToken(token) }).lean();

    if (!request) {
        const error = new Error('Link persetujuan tidak ditemukan atau sudah tidak valid.');
        error.status = 404;
        throw error;
    }

    return toPublicSummary(request);
};

exports.decideDeletionRequest = async (token, action) => {
    const normalizedAction = String(action || '').trim().toLowerCase();

    if (!['approve', 'reject'].includes(normalizedAction)) {
        const error = new Error('Aksi tidak valid.');
        error.status = 400;
        throw error;
    }

    const request = await AccountDeletionRequest.findOne({ decisionTokenHash: hashToken(token) });

    if (!request) {
        const error = new Error('Permintaan penghapusan tidak ditemukan.');
        error.status = 404;
        throw error;
    }

    if (request.status !== 'pending') {
        return {
            request: toPublicSummary(request),
            alreadyHandled: true,
        };
    }

    request.decidedAt = new Date();

    if (normalizedAction === 'approve') {
        request.status = 'approved';
        request.decisionNote = 'Permintaan disetujui oleh Project Owner. Akun telah dihapus dari sistem.';
        await executeApprovedDeletion(request);
        await request.save();

        await Promise.all([
            sendRequesterDecisionEmail(request),
            sendTargetDeletedEmail(request),
        ]);
    } else {
        request.status = 'rejected';
        request.decisionNote = 'Permintaan ditolak oleh Project Owner. Akun tetap aktif.';
        await request.save();
        await sendRequesterDecisionEmail(request);
    }

    return {
        request: toPublicSummary(request),
        alreadyHandled: false,
    };
};

exports.attachLatestDeletionRequestSummary = async (users) => {
    const normalizedUsers = Array.isArray(users) ? users : [];
    const userIds = normalizedUsers
        .map((user) => String(user?._id || ''))
        .filter(Boolean);

    if (userIds.length === 0) {
        return normalizedUsers;
    }

    const requests = await AccountDeletionRequest.find({
        targetUser: { $in: userIds },
    })
        .sort({ createdAt: -1 })
        .lean();

    const latestByTarget = new Map();

    for (const request of requests) {
        const key = String(request.targetUser);
        if (!latestByTarget.has(key)) {
            latestByTarget.set(key, toPublicSummary(request));
        }
    }

    return normalizedUsers.map((user) => ({
        ...user,
        deletionRequest: latestByTarget.get(String(user._id)) || null,
    }));
};
