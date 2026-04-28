const WA_GRAPH_VERSION = process.env.WA_GRAPH_VERSION || 'v19.0';

const isWhatsAppConfigured = () => {
  const token = process.env.WA_CLOUD_TOKEN || '';
  const phoneId = process.env.WA_PHONE_NUMBER_ID || '';
  
  // Exclude placeholder values
  const isPlaceholder = (val) => {
    if (!val) return true;
    return val.includes('your-') || val.includes('example') || val === 'placeholder';
  };
  
  return !isPlaceholder(token) && !isPlaceholder(phoneId);
};

exports.sendOtpWhatsApp = async ({ toPhoneE164, otp, expiresMinutes }) => {
  // Dev fallback: log OTP if WhatsApp not configured
  if (!isWhatsAppConfigured()) {
    console.log(`\n💬 DEV MODE: OTP untuk ${toPhoneE164}\n   Kode: ${otp}\n   Berlaku: ${expiresMinutes} menit\n`);
    return;
  }

  const token = process.env.WA_CLOUD_TOKEN;
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;

  const url = `https://graph.facebook.com/${WA_GRAPH_VERSION}/${phoneNumberId}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to: toPhoneE164,
    type: 'text',
    text: { body: `Kode OTP reset password kamu: ${otp}\nBerlaku ${expiresMinutes} menit.` },
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    throw new Error(`WhatsApp send failed (${resp.status}): ${detail}`);
  }
};

