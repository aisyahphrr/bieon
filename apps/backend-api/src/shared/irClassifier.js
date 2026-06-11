const fs = require('fs');
const path = require('path');

const IR_DB_DIR = path.join(__dirname, '../constants/ir-database');

const normalizeHex = (hex) => {
  if (!hex) return '';
  return String(hex)
    .trim()
    .replace(/^0x/i, '')
    .toUpperCase();
};

const classifyIrSignal = (rawHex) => {
  const normalizedInputHex = normalizeHex(rawHex);
  if (!normalizedInputHex) return null;

  try {
    if (!fs.existsSync(IR_DB_DIR)) return null;
    const files = fs.readdirSync(IR_DB_DIR).filter(file => file.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(IR_DB_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      try {
        const config = JSON.parse(content);
        if (config && config.buttons) {
          for (const [buttonKey, buttonVal] of Object.entries(config.buttons)) {
            if (normalizeHex(buttonVal) === normalizedInputHex) {
              return {
                brand: config.brand,
                deviceType: config.deviceType,
                buttonKey,
                label: buttonKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                notes: `Terdeteksi otomatis: ${config.brand} ${config.deviceType} (${buttonKey})`
              };
            }
          }
        }
      } catch (err) {
        // Silently skip corrupted files
      }
    }
  } catch (err) {
    console.error('Error during IR signal classification:', err);
  }
  return null;
};

module.exports = {
  classifyIrSignal
};
