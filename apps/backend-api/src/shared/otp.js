const crypto = require('crypto');

exports.generateNumericOtp = () => {
  const n = crypto.randomInt(0, 1000000);
  return String(n).padStart(6, '0');
};

exports.isValidOtp = (otp) => /^\d{6}$/.test(String(otp || '').trim());

