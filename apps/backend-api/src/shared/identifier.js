exports.normalizeEmail = (email) => String(email || '').trim().toLowerCase();

exports.isValidEmail = (email) => {
  const e = exports.normalizeEmail(email);
  // Simple check; we only need to separate email vs phone.
  return e.includes('@') && e.length >= 3;
};

exports.normalizePhoneE164 = (phone) => String(phone || '').trim().replace(/\s+/g, '');

exports.isValidIdPhone = (phone) => {
  const p = exports.normalizePhoneE164(phone);
  return /^\+62\d{9,14}$/.test(p);
};

