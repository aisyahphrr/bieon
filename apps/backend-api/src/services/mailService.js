const nodemailer = require('nodemailer');

const profiles = {
    resend: () => ({
        host: process.env.RESEND_SMTP_HOST || '',
        port: Number(process.env.RESEND_SMTP_PORT || 587),
        secure: String(process.env.RESEND_SMTP_SECURE || 'false').toLowerCase() === 'true',
        auth: {
            user: process.env.RESEND_SMTP_USER || '',
            pass: process.env.RESEND_SMTP_PASS || '',
        },
        from: process.env.RESEND_MAIL_FROM || 'BIEON System <no-reply@bieon.local>',
    }),
    gmail: () => ({
        host: process.env.GMAIL_SMTP_HOST || '',
        port: Number(process.env.GMAIL_SMTP_PORT || 587),
        secure: String(process.env.GMAIL_SMTP_SECURE || 'false').toLowerCase() === 'true',
        auth: {
            user: process.env.GMAIL_SMTP_USER || '',
            pass: process.env.GMAIL_SMTP_PASS || '',
        },
        from: process.env.GMAIL_MAIL_FROM || 'BIEON System <no-reply@bieon.local>',
    }),
};

let transporterCache = {};

const getTransporter = (profile = 'resend') => {
    if (transporterCache[profile]) return transporterCache[profile];

    const config = profiles[profile] ? profiles[profile]() : null;
    if (!config || !config.host || !config.auth.user || !config.auth.pass) {
        console.warn(`[mail] SMTP not configured for profile "${profile}".`);
        return null;
    }

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user, // Note: nodemailer expects 'user' inside 'auth', but our profile uses auth.user. Fixing below.
            user: config.auth.user,
            pass: config.auth.pass,
        },
    });

    transporterCache[profile] = transporter;
    return transporter;
};

const isMailConfigured = (profile = 'resend') => {
    const config = profiles[profile] ? profiles[profile]() : null;
    return Boolean(config && config.host && config.auth.user && config.auth.pass);
};

/**
 * @param {Object} param0
 * @param {string} param0.to            – recipient address
 * @param {string} param0.subject       – email subject
 * @param {string} [param0.html]       – HTML body
 * @param {string} [param0.text]       – plain-text body
 * @param {'resend'|'gmail'} [param0.transport] – which SMTP profile to use
 */
const sendMail = async ({ to, subject, html, text, transport }) => {
    // Auto-detect transport if not supplied
    const chosenProfile = transport
        ? transport
        : to && to.toLowerCase() === (process.env.PROJECT_OWNER_EMAIL || '').toLowerCase()
            ? 'gmail'
            : 'resend';

    const transporter = getTransporter(chosenProfile);
    const config = profiles[chosenProfile]();

    if (!transporter) {
        console.warn(`[mail] SMTP not configured for profile "${chosenProfile}". Email to ${to} skipped.`);
        return {
            sent: false,
            skipped: true,
            reason: `SMTP not configured for profile "${chosenProfile}"`,
        };
    }

    try {
        const info = await transporter.sendMail({
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
        console.error(`[mail] [${chosenProfile}] Failed to send email:`, error.message);
        return {
            sent: false,
            skipped: false,
            reason: error.message,
        };
    }
};

module.exports = {
    isMailConfigured,
    sendMail,
    getTransporter,
};
