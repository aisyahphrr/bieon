const nodemailer = require('nodemailer');

let cachedTransport = null;

const isSmtpConfigured = () => {
  const host = process.env.SMTP_HOST || '';
  const port = process.env.SMTP_PORT || '';
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.SMTP_FROM || '';
  
  // Exclude placeholder values
  const isPlaceholder = (val) => {
    if (!val) return true;
    return val.includes('example') || val.includes('your-') || val === 'placeholder';
  };
  
  return !isPlaceholder(host) && !isPlaceholder(port) && !isPlaceholder(user) && !isPlaceholder(pass) && !isPlaceholder(from);
};

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
  // Dev fallback: log OTP if SMTP not configured
  if (!isSmtpConfigured()) {
    console.log(`\n📧 DEV MODE: OTP untuk ${to}\n   Kode: ${otp}\n   Berlaku: ${expiresMinutes} menit\n`);
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transport = getTransport();

  await transport.sendMail({
    from,
    to,
    subject: 'Kode OTP Reset Password - BIEON',
    html: `
      <h2>Permintaan Reset Password</h2>
      <p>Kode OTP kamu adalah: <strong>${otp}</strong></p>
      <p>Kode ini berlaku selama ${expiresMinutes} menit. Jangan berikan kode ini kepada siapapun.</p>
    `,
  });

  console.log(`✅ Email OTP berhasil dikirim ke: ${to}`);
};

