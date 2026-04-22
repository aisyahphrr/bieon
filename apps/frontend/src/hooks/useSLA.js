import { useState, useEffect, useMemo } from 'react';

export const useSLA = (createdAt, assignedAt, processStartedAt, status) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const slaData = useMemo(() => {
        const s = status?.toLowerCase();
        if (!createdAt || s === 'selesai' || s === 'ditolak' || s === 'menunggu konfirmasi pelanggan' || s === 'unassigned') {
            return { timer: null, points: 0, timeElapsedMinutes: 0, level: 'emerald', isOverdue: false, type: null };
        }

        const assignedDate = assignedAt ? new Date(assignedAt) : null;
        const processDate = processStartedAt ? new Date(processStartedAt) : null;
        const nowMs = now.getTime();
        
        // --- RESPONSE SLA Target: 15 Minutes ---
        if ((s === 'menunggu respons' || s === 'overdue respons') && assignedDate) {
            const targetMs = 15 * 60 * 1000;
            const diffMs = nowMs - assignedDate.getTime();
            const remainingMs = targetMs - diffMs;
            const elapsedMin = Math.floor(Math.max(0, diffMs) / (1000 * 60));

            // Points logic (consistent with backend)
            let resPts = 0;
            if (elapsedMin <= 5) resPts = 100;
            else if (elapsedMin <= 10) resPts = 95;
            else if (elapsedMin <= 15) resPts = 90;
            else if (elapsedMin <= 20) resPts = 85;
            else if (elapsedMin <= 25) resPts = 80;
            else if (elapsedMin <= 30) resPts = 70;

            const isOverdue = remainingMs < 0;
            const level = remainingMs <= -15 * 60 * 1000 ? 'red' : (remainingMs <= 0 ? 'amber' : 'emerald');

            return {
                timer: formatTimer(remainingMs),
                points: resPts,
                level,
                isOverdue,
                timeElapsedMinutes: elapsedMin,
                type: 'Response'
            };
        }

        // --- REPAIR SLA Target: 48 Hours ---
        if ((s === 'diproses' || s === 'overdue perbaikan') && processDate) {
            const targetMs = 48 * 60 * 60 * 1000;
            const diffMs = nowMs - processDate.getTime();
            const remainingMs = targetMs - diffMs;
            const elapsedHours = Math.floor(Math.max(0, diffMs) / (1000 * 60 * 60));

            let repPts = 0;
            if (elapsedHours <= 24) repPts = 100;
            else if (elapsedHours <= 46) repPts = 95;
            else if (elapsedHours <= 48) repPts = 90;
            else if (elapsedHours <= 50) repPts = 85;
            else if (elapsedHours <= 52) repPts = 80;
            else if (elapsedHours <= 54) repPts = 70;
            else if (elapsedHours <= 56) repPts = 60;

            const isOverdue = remainingMs < 0;
            const level = remainingMs <= -8 * 60 * 60 * 1000 ? 'red' : (remainingMs <= 0 ? 'amber' : 'emerald');

            return {
                timer: formatTimer(remainingMs),
                points: repPts,
                level,
                isOverdue,
                timeElapsedMinutes: Math.floor(diffMs / (1000 * 60)),
                type: 'Repair'
            };
        }

        return { timer: null, points: 0, timeElapsedMinutes: 0, level: 'emerald', isOverdue: false, type: null };
    }, [now, createdAt, assignedAt, processStartedAt, status]);

    return slaData;
};

function formatTimer(ms) {
    const isNegative = ms < 0;
    const absMs = Math.abs(ms);
    const totalSeconds = Math.floor(absMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const prefix = isNegative ? '-' : '';
    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');

    // Selalu tampilkan HH:mm:ss sesuai permintaan user
    return `${prefix}${hStr}:${mStr}:${sStr}`;
}
