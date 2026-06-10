const KendaliPerangkat = require('../models/KendaliPerangkat');
const Activity = require('../models/Activity');
const { publishCommand } = require('../config/mqtt');
const { broadcastDeviceTelemetry } = require('../shared/socketEmitter');

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

module.exports = { startScheduler, stopScheduler };
