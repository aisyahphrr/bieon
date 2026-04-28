const nodemailer = require('nodemailer');

let cachedTransport = null;

const getTransport = () => {
  if (cachedTransport) return cachedTransport;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP env belum lengkap (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)');
  }

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return cachedTransport;
};

exports.sendOtpEmail = async ({ to, otp, expiresMinutes }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) throw new Error('SMTP_FROM belum diset');

  const transport = getTransport();

  await transport.sendMail({
    from,
    to,
    subject: 'Kode OTP Reset Password',
    text: `Kode OTP reset password kamu: ${otp}\nBerlaku ${expiresMinutes} menit.`,
  });
};

