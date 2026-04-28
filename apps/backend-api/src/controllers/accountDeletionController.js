const accountDeletionService = require('../modules/admin/accountDeletionService');

exports.getRequestByToken = async (req, res) => {
    try {
        const data = await accountDeletionService.getRequestByToken(req.params.token);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : 'Gagal mengambil data persetujuan penghapusan akun.',
            error: error.message,
        });
    }
};

exports.decideRequest = async (req, res) => {
    try {
        const result = await accountDeletionService.decideDeletionRequest(req.params.token, req.body.action);

        res.status(200).json({
            success: true,
            message: result.alreadyHandled
                ? 'Permintaan ini sudah pernah diproses sebelumnya.'
                : 'Keputusan Project Owner berhasil diproses.',
            data: result.request,
            alreadyHandled: result.alreadyHandled,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : 'Gagal memproses keputusan penghapusan akun.',
            error: error.message,
        });
    }
};
