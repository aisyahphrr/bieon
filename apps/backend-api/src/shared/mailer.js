const { sendMail } = require('../services/mailService');

exports.sendOtpEmail = async ({ to, otp, expiresMinutes }) => {
  const subject = 'Kode OTP Reset Password - BIEON';
  const html = `
    <h2>Permintaan Reset Password</h2>
    <p>Kode OTP kamu adalah: <strong>${otp}</strong></p>
    <p>Kode ini berlaku selama ${expiresMinutes} menit. Jangan berikan kode ini kepada siapapun.</p>
  `;

  // Explicitly use the 'resend' transport for OTP emails
  const result = await sendMail({
    to,
    subject,
    html,
    transport: 'resend',
  });

  if (result.sent) {
    console.log(`✅ Email OTP berhasil dikirim ke: ${to}`);
  } else if (result.skipped) {
    // For development, if Resend is not configured, we log the OTP to the console
    console.log(`\n📧 DEV MODE (Resend skipped): OTP untuk ${to}\n   Kode: ${otp}\n   Berlaku: ${expiresMinutes} menit\n`);
  } else {
    throw new Error(result.reason || 'Gagal mengirim email OTP');
  }
};
