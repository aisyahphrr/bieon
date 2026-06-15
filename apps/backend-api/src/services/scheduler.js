const KendaliPerangkat = require('../models/KendaliPerangkat');
const Activity = require('../models/Activity');
const { publishCommand } = require('../config/mqtt');
const { broadcastDeviceTelemetry } = require('../shared/socketEmitter');

const triggerRemoteMappingCommand = async (device, mapping, triggerType = 'sensor') => {
    try {
        const Hub = require('../models/Hub');
        const Activity = require('../models/Activity');
        const Alert = require('../models/Alert');

        let bieonId = device.bieonId;
        if (!bieonId && device.hubId) {
            const hub = await Hub.findById(device.hubId).lean();
            if (hub) {
                bieonId = hub.bieonId;
            }
        }
        if (!bieonId) {
            console.warn(`[triggerRemoteMappingCommand] Bieon ID tidak tersedia untuk device ${device.name}`);
            return;
        }

        const normalizedDeviceIeee = String(device.device_ieee || device.modelId || device.name || '').replace(/[:\-\s]/g, '').toLowerCase() || undefined;
        const adminTopic = `bieon/${bieonId}/admin/command`;

        const {
            catalogId,
            rawSignature,
            rawBitText,
            rawBitHex,
            rawBitBinary,
            sourceRemoteIeee,
            sourceRemoteId,
            functionKey,
            functionLabel,
            label,
            protocol
        } = mapping;

        let raw_hex = rawBitHex || '';
        let bits = 0;
        let inferredProtocol = protocol || undefined;

        if (rawSignature && typeof rawSignature === 'string') {
            const sigParts = rawSignature.split('|');
            if (sigParts.length >= 3) {
                const sigProtocol = sigParts[0];
                const sigBits = Number(sigParts[1]);
                if (!inferredProtocol && sigProtocol && sigProtocol !== 'unknown') {
                    inferredProtocol = sigProtocol;
                }
                if (!bits && sigBits && !isNaN(sigBits)) {
                    bits = sigBits;
                }
            }
        }

        const tryExtractFromObject = (obj) => {
            if (!obj || typeof obj !== 'object') return false;
            if (obj.raw_hex) raw_hex = raw_hex || String(obj.raw_hex);
            if (obj.raw_value) raw_hex = raw_hex || String(obj.raw_value);
            if (obj.raw) raw_hex = raw_hex || String(obj.raw);
            if (obj.rawBit) raw_hex = raw_hex || String(obj.rawBit);
            if (obj.raw_bit) raw_hex = raw_hex || String(obj.raw_bit);
            if (obj.rawBitHex) raw_hex = raw_hex || String(obj.rawBitHex);
            if (obj.bits && Number(obj.bits)) bits = bits || Number(obj.bits);
            if (obj.bit_length && Number(obj.bit_length)) bits = bits || Number(obj.bit_length);
            if (obj.bit_count && Number(obj.bit_count)) bits = bits || Number(obj.bit_count);
            if (obj.protocol) inferredProtocol = inferredProtocol || String(obj.protocol);
            return !!(raw_hex || bits);
        };

        if (rawBitText && typeof rawBitText === 'string') {
            let parsed = null;
            try {
                parsed = JSON.parse(rawBitText);
            } catch (e) {
                parsed = null;
            }
            if (parsed) {
                tryExtractFromObject(parsed);
                const raw_bit_field = parsed.raw_bit || parsed.rawBit || parsed.rawBitText || parsed.raw_bit_text;
                if (raw_bit_field && typeof raw_bit_field === 'string') {
                    const parts = raw_bit_field.split(';');
                    for (const p of parts) {
                        const kv = p.split('=');
                        if (kv.length === 2) {
                            const k = kv[0].trim();
                            const v = kv[1].trim();
                            if ((k === 'raw' || k === 'raw_hex') && v) raw_hex = raw_hex || v;
                            if ((k === 'bits' || k === 'bit_length' || k === 'bit_count') && Number(v)) bits = bits || Number(v);
                            if (k === 'protocol' && v) inferredProtocol = inferredProtocol || v;
                        }
                    }
                }
            } else {
                const hexMatch = rawBitText.match(/raw(?:_hex|_value)?["']?\s*[:=]\s*["']?(0x[0-9a-fA-F]+)/i);
                if (hexMatch) {
                    raw_hex = raw_hex || hexMatch[1];
                }
                const bitsMatch = rawBitText.match(/(?:bits|bit_length|bit_count)["']?\s*[:=]\s*["']?(\d+)/i);
                if (bitsMatch) {
                    bits = bits || Number(bitsMatch[1]);
                }
                const protoMatch = rawBitText.match(/protocol["']?\s*[:=]\s*["']?(\d+)/i);
                if (protoMatch) {
                    inferredProtocol = inferredProtocol || protoMatch[1];
                }
            }
        }

        if ((!raw_hex || raw_hex === '') && rawBitBinary) {
            const bin = String(rawBitBinary || '').replace(/[^01]/g, '');
            if (bin.length > 0) {
                bits = bits || Math.min(bin.length, 64);
                try {
                    const value = BigInt('0b' + bin.slice(0, bits));
                    raw_hex = raw_hex || ('0x' + value.toString(16));
                } catch (e) {}
            }
        }

        if ((!raw_hex || raw_hex === '') && rawBitText && typeof rawBitText === 'string') {
            const txt = rawBitText.trim();
            if (/^[01]{1,64}$/.test(txt)) {
                bits = bits || Math.min(txt.length, 64);
                const value = BigInt('0b' + txt.slice(0, bits));
                raw_hex = raw_hex || ('0x' + value.toString(16));
            } else if (/^0x[0-9a-fA-F]+$/.test(txt)) {
                raw_hex = raw_hex || txt;
            }
        }

        if ((!raw_hex || raw_hex === '') && rawBitHex) {
            raw_hex = String(rawBitHex || '');
        }

        if ((!bits || bits === 0) && raw_hex && raw_hex.length > 0) {
            const hx = raw_hex.replace(/^0x/i, '').replace(/[^0-9a-fA-F]/g, '');
            if (hx.length > 0) bits = Math.min(hx.length * 4, 64);
        }

        const isTransmitRaw = inferredProtocol === 'raw' || String(inferredProtocol).toLowerCase() === 'raw';

        const payload = {
            command: isTransmitRaw ? 'transmit_raw' : 'transmit',
            action: isTransmitRaw ? 'transmit_raw' : (functionKey || 'remote'),
            rawBitText: rawBitText || undefined,
            rawBitHex: rawBitHex || undefined,
            rawBitBinary: rawBitBinary || undefined,
            raw_signature: rawSignature || undefined,
            raw_hex: raw_hex || undefined,
            raw_value: raw_hex || undefined,
            bits: isTransmitRaw ? undefined : (bits ? String(bits) : undefined),
            protocol: isTransmitRaw ? 'raw' : (inferredProtocol ? String(inferredProtocol) : undefined),
            sourceRemoteIeee: sourceRemoteIeee || undefined,
            sourceRemoteId: sourceRemoteId || undefined,
            target_ieee: normalizedDeviceIeee,
            ieee: normalizedDeviceIeee,
            device_ieee: normalizedDeviceIeee,
            device_id: String(device._id),
            catalog_id: catalogId || undefined,
            label: label || functionLabel || undefined,
            command_id: `cmd_${Date.now()}`,
            requested_by: 'automation',
            timestamp: Date.now()
        };

        console.log(`[MQTT] [Automation - Mapping] Publishing to ${adminTopic}:`, JSON.stringify(payload));
        publishCommand(adminTopic, payload);

        await new Activity({
            user: device.owner,
            hub: device.hubId,
            room: device.location,
            actuator: `${device.name} (${functionLabel})`,
            status: triggerType === 'sensor' ? 'TRIGGERED' : (triggerType === 'ON' ? 'ON' : 'OFF'),
            action: `Kirim Perintah ${functionLabel}`,
            trigger: `Otomasi (${triggerType === 'sensor' ? 'Sensor' : 'Jadwal'})`
        }).save();

        await Alert.create({
            owner: device.owner,
            hub: device.hubId,
            category: mapping.environmentAspect === 'Kualitas Air' ? 'Air Sanitasi' : (mapping.environmentAspect || 'Sistem'),
            title: `Otomasi Remote: ${functionLabel}`,
            message: `Sistem otomatis mengirim perintah remote "${functionLabel}" pada perangkat "${device.name}" di ${device.location} via Otomasi (${triggerType === 'sensor' ? 'Sensor' : 'Jadwal'}).`,
            type: 'Info',
            link: 'kendali',
            metadata: { deviceId: device._id }
        });

    } catch (err) {
        console.error(`[triggerRemoteMappingCommand] Error:`, err);
    }
};

// Convert string like "08:00 AM" or "08:00" to military hours and minutes for comparison
function parseTime(timeStr) {
    if (!timeStr) return null;
    let [time, modifier] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12' && (!modifier || modifier.toUpperCase() === 'AM')) {
        hours = '00';
    }
    if (modifier && modifier.toUpperCase() === 'PM' && hours !== '12') {
        hours = parseInt(hours, 10) + 12;
    }

    return {
        hours: parseInt(hours, 10),
        minutes: parseInt(minutes, 10)
    };
}

let schedulerInterval = null;

const startScheduler = () => {
    console.log('\n⏳ Scheduler Otomatis berjalan (Cek setiap 1 menit)...');

    // Run interval every 1 minute
    schedulerInterval = setInterval(async () => {
        try {
            // Dapatkan waktu saat ini di zona Asia/Jakarta
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Jakarta',
                hour12: false,
                hour: 'numeric',
                minute: 'numeric',
                weekday: 'long'
            });
            const parts = formatter.formatToParts(now);

            let currentHour, currentMinute, currentWeekday;
            parts.forEach(p => {
                if (p.type === 'hour') currentHour = parseInt(p.value, 10);
                if (p.type === 'minute') currentMinute = parseInt(p.value, 10);
                if (p.type === 'weekday') currentWeekday = p.value; // e.g., 'Monday'
            });

            // Konversi weekday English ke Indonesia (sesuai format yang disimpan frontend)
            const mapDay = {
                'Sunday': 'Minggu',
                'Monday': 'Senin',
                'Tuesday': 'Selasa',
                'Wednesday': 'Rabu',
                'Thursday': 'Kamis',
                'Friday': 'Jumat',
                'Saturday': 'Sabtu'
            };
            const currentHari = mapDay[currentWeekday];

            // Cari semua perangkat dengan Mode 'Jadwal', populate hubId untuk akses bieonId
            const Hub = require('../models/Hub');
            const scheduledDevices = await KendaliPerangkat.find({
                controlMethod: 'Jadwal'
            }).lean();

            if (scheduledDevices.length > 0) {
                console.log(`[Scheduler] ⏰ Pengecekan Jam ${currentHour}:${String(currentMinute).padStart(2, '0')} WIB (${currentHari}). Ada ${scheduledDevices.length} alat mode Jadwal.`);
            }

            for (const device of scheduledDevices) {
                if (!device.scheduleSettings || device.scheduleSettings.length === 0) continue;

                let shouldBeOn = false;

                // Evaluasi setiap jadwal
                for (const sched of device.scheduleSettings) {
                    // Cek apakah hari ini dijadwalkan
                    if (!sched.days || !sched.days.includes(currentHari)) continue;

                    const startTime = parseTime(sched.startTime);
                    const endTime = parseTime(sched.endTime);

                    if (!startTime || !endTime) continue;

                    const currentTotal = currentHour * 60 + currentMinute;
                    const startTotal = startTime.hours * 60 + startTime.minutes;
                    const endTotal = endTime.hours * 60 + endTime.minutes;

                    if (startTotal <= endTotal) {
                        // Kasus normal: 08:00 - 17:00
                        if (currentTotal >= startTotal && currentTotal < endTotal) {
                            shouldBeOn = true;
                            break;
                        }
                    } else {
                        // Kasus lewat tengah malam: 22:00 - 06:00
                        if (currentTotal >= startTotal || currentTotal < endTotal) {
                            shouldBeOn = true;
                            break;
                        }
                    }
                }

                // Ambil bieonId dari device atau hub
                let bieonId = device.bieonId || null;
                let hubObjectId = device.hubId;

                if (!bieonId && device.hubId) {
                    const hub = await Hub.findById(device.hubId).lean();
                    if (hub) {
                        bieonId = hub.bieonId;
                    }
                }

                // Normalize IEEE address (sama seperti toggleDevice di controller)
                const normalizedIeee = String(device.device_ieee || device.modelId || device.name || '').replace(/[:\-\s]/g, '').toLowerCase();

                // Enforce status based on whether it should be on
                if (shouldBeOn) {
                    if (String(device.status) !== '1') {
                        console.log(`[Scheduler] ⚡ WAKTUNYA NYALA untuk "${device.name}" | bieonId: ${bieonId} | ieee: ${normalizedIeee}`);

                        // Kirim MQTT ke topic admin (SAMA PERSIS dengan toggleDevice)
                        if (bieonId) {
                            const adminTopic = `bieon/${bieonId}/admin/command`;
                            const adminPayload = {
                                command: 'on',
                                action: 'on',
                                status: '1',
                                bieon_id: bieonId,
                                ieee: normalizedIeee,
                                device_ieee: normalizedIeee,
                                device_id: String(device._id),
                                command_id: `cmd_${Date.now()}`,
                                requested_by: String(device.owner),
                                timestamp: Date.now()
                            };
                            publishCommand(adminTopic, adminPayload);
                            console.log(`[Scheduler] 📡 Published ON to ${adminTopic} | payload:`, JSON.stringify(adminPayload));
                        } else {
                            console.warn(`[Scheduler] ⚠️  bieonId tidak tersedia untuk "${device.name}", skip MQTT publish.`);
                        }

                        await KendaliPerangkat.findByIdAndUpdate(device._id, { status: '1', lastActivity: new Date() });

                        // LOGGING KE AKTIVITAS TERBARU
                        await new Activity({
                            user: device.owner,
                            hub: hubObjectId,
                            room: device.location,
                            actuator: device.name,
                            status: 'ON',
                            action: 'Menyalakan',
                            trigger: 'Otomasi (Jadwal)'
                        }).save();

                        broadcastDeviceTelemetry(hubObjectId, {
                            _id: device._id,
                            status: '1'
                        });
                    }
                } else {
                    // Jika di luar jadwal, paksa MATI
                    if (String(device.status) !== '0') {
                        console.log(`[Scheduler] ⚡ WAKTUNYA MATI untuk "${device.name}" | bieonId: ${bieonId} | ieee: ${normalizedIeee}`);

                        // Kirim MQTT ke topic admin (SAMA PERSIS dengan toggleDevice)
                        if (bieonId) {
                            const adminTopic = `bieon/${bieonId}/admin/command`;
                            const adminPayload = {
                                command: 'off',
                                action: 'off',
                                status: '0',
                                bieon_id: bieonId,
                                ieee: normalizedIeee,
                                device_ieee: normalizedIeee,
                                device_id: String(device._id),
                                command_id: `cmd_${Date.now()}`,
                                requested_by: String(device.owner),
                                timestamp: Date.now()
                            };
                            publishCommand(adminTopic, adminPayload);
                            console.log(`[Scheduler] 📡 Published OFF to ${adminTopic} | payload:`, JSON.stringify(adminPayload));
                        } else {
                            console.warn(`[Scheduler] ⚠️  bieonId tidak tersedia untuk "${device.name}", skip MQTT publish.`);
                        }

                        await KendaliPerangkat.findByIdAndUpdate(device._id, { status: '0', lastActivity: new Date() });

                        // LOGGING KE AKTIVITAS TERBARU
                        await new Activity({
                            user: device.owner,
                            hub: hubObjectId,
                            room: device.location,
                            actuator: device.name,
                            status: 'OFF',
                            action: 'Mematikan',
                            trigger: 'Otomasi (Jadwal)'
                        }).save();

                        broadcastDeviceTelemetry(hubObjectId, {
                            _id: device._id,
                            status: '0'
                        });
                    }
                }
            }

            // 1b. CEK JADWAL REMOTE MAPPINGS (Otomatisasi Tombol Remote)
            const remoteDevices = await KendaliPerangkat.find({
                "remoteState.mappings.controlMethod": "Jadwal"
            });

            for (const device of remoteDevices) {
                const mappings = (device.remoteState && typeof device.remoteState.get === 'function'
                    ? device.remoteState.get('mappings')
                    : device.remoteState?.mappings) || [];
                let hasChanges = false;

                for (const mapping of mappings) {
                    if (mapping.controlMethod !== 'Jadwal' || !mapping.scheduleSettings) continue;

                    for (const sched of mapping.scheduleSettings) {
                        if (!sched.days || !sched.days.includes(currentHari)) continue;

                        const startTime = parseTime(sched.startTime);
                        const endTime = parseTime(sched.endTime);

                        if (!startTime || !endTime) continue;

                        const currentTotal = currentHour * 60 + currentMinute;
                        const startTotal = startTime.hours * 60 + startTime.minutes;
                        const endTotal = endTime.hours * 60 + endTime.minutes;

                        const isStartMatch = (currentTotal === startTotal);
                        const isEndMatch = (currentTotal === endTotal);

                        if (isStartMatch || isEndMatch) {
                            const lastTriggerMinute = mapping.lastScheduledTrigger || 0;
                            if (lastTriggerMinute === currentTotal) {
                                continue;
                            }

                            console.log(`[Scheduler] 📡 TOMBOL REMOTE RUNNING JADWAL untuk "${device.name}" | Tombol: ${mapping.functionLabel} | Waktu: ${currentHour}:${String(currentMinute).padStart(2, '0')}`);
                            
                            mapping.lastScheduledTrigger = currentTotal;
                            hasChanges = true;

                            await triggerRemoteMappingCommand(device, mapping, isStartMatch ? 'ON' : 'OFF');
                        }
                    }
                }

                if (hasChanges) {
                    device.markModified('remoteState');
                    await device.save();
                }
            }

            // 2. CEK SLA PENGADUAN (Auto-overdue)
            try {
                const { checkAndUpdateSLAStatuses } = require('../controllers/complaintController');
                if (typeof checkAndUpdateSLAStatuses === 'function') {
                    await checkAndUpdateSLAStatuses();
                }
            } catch (err) {
                console.error('[Scheduler] Gagal mengecek SLA Pengaduan:', err.message);
            }

        } catch (error) {
            console.error('Error in background scheduler:', error);
        }
    }, 60000); // Setiap 60 detik
};

const stopScheduler = () => {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        console.log('🛑 Scheduler Otomatis dihentikan.');
    }
};

module.exports = { startScheduler, stopScheduler, triggerRemoteMappingCommand };
