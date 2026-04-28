exports.normalizeEmail = (email) => String(email || '').trim().toLowerCase();

exports.isValidEmail = (email) => {
  const e = exports.normalizeEmail(email);
  // Simple check; we only need to separate email vs phone.
  return e.includes('@') && e.length >= 3;
};

exports.normalizePhoneE164 = (phone) => {
  let p = String(phone || '').trim().replace(/[^\d+]/g, ''); // Hapus karakter non-digit kecuali +
  
  // Jika dimulai dengan 08..., ubah menjadi +628...
  if (p.startsWith('0')) {
    p = '+62' + p.slice(1);
  } 
  // Jika dimulai dengan 62... (tanpa +), tambahkan +
  else if (p.startsWith('62') && !p.startsWith('+')) {
    p = '+' + p;
  }
  // Jika tidak dimulai dengan +, asumsikan ini butuh + (default Indonesia jika 8...)
  else if (p.length > 0 && !p.startsWith('+')) {
    if (p.startsWith('8')) p = '+62' + p;
    else p = '+' + p;
  }
  
  return p;
};

exports.isValidIdPhone = (phone) => {
  const p = exports.normalizePhoneE164(phone);
  return /^\+62\d{9,14}$/.test(p);
};

