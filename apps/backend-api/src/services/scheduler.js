const KendaliPerangkat = require('../models/KendaliPerangkat');
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

            // Konversi weekday English to Indonesia
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

            // Cari semua perangkat dengan Mode 'Jadwal'
            const scheduledDevices = await KendaliPerangkat.find({ 
                controlMethod: 'Jadwal'
            });

            if(scheduledDevices.length > 0) {
                // Silent check, can be un-commented for deep debugging
                // console.log(`[Scheduler] Pengecekan rutin... Jam ${currentHour}:${currentMinute} WIB (${currentHari}). Ada ${scheduledDevices.length} alat dengan mode Jadwal.`);
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

                // Enforce status based on whether it should be on
                if (shouldBeOn) {
                    if (String(device.status) !== '1') {
                        console.log(`[Scheduler] ⏰ WAKTUNYA NYALA untuk ${device.name}`);
                        
                        const topicCommand = `bieon/${device.name.replace(/\s+/g, '_')}/command`;
                        publishCommand(topicCommand, '1');
                        
                        await KendaliPerangkat.findByIdAndUpdate(device._id, { status: '1', lastActivity: new Date() });
                        
                        broadcastDeviceTelemetry(device.hubId, {
                            _id: device._id,
                            status: '1'
                        });
                    }
                } else {
                    // Jika di luar jadwal, paksa MATI
                    if (String(device.status) !== '0') {
                        console.log(`[Scheduler] ⏰ WAKTUNYA MATI untuk ${device.name}`);

                        const topicCommand = `bieon/${device.name.replace(/\s+/g, '_')}/command`;
                        publishCommand(topicCommand, '0');
                        
                        await KendaliPerangkat.findByIdAndUpdate(device._id, { status: '0', lastActivity: new Date() });
                        
                        broadcastDeviceTelemetry(device.hubId, {
                            _id: device._id,
                            status: '0'
                        });
                    }
                }
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
}

module.exports = { startScheduler, stopScheduler };
