const nodemailer = require('nodemailer');

let transporter;

const getMailConfig = () => ({
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || process.env.SMTP_USER || 'BIEON System <no-reply@bieon.local>',
});

const isMailConfigured = () => {
    const config = getMailConfig();
    return Boolean(config.host && config.port && config.user && config.pass);
};

const getTransporter = () => {
    if (transporter) return transporter;

    const config = getMailConfig();
    transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass,
        },
    });

    return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
    const config = getMailConfig();

    if (!isMailConfigured()) {
        console.warn(`[mail] SMTP not configured. Email to ${to} skipped.`);
        return {
            sent: false,
            skipped: true,
            reason: 'SMTP not configured',
        };
    }

    try {
        const info = await getTransporter().sendMail({
            from: config.from,
            to,
            subject,
            html,
            text,
        });

        return {
            sent: true,
            messageId: info.messageId,
        };
    } catch (error) {
        console.error('[mail] Failed to send email:', error.message);
        return {
            sent: false,
            skipped: false,
            reason: error.message,
        };
    }
};

module.exports = {
    getMailConfig,
    isMailConfigured,
    sendMail,
};
