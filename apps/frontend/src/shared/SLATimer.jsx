import React, { useState, useEffect } from 'react';

const SLATimer = ({ startTime, status, type }) => {
    const [timerDisplay, setTimerDisplay] = useState('00:00:00');
    const [colorClass, setColorClass] = useState('opacity-80 font-medium');

    useEffect(() => {
        if (!startTime) return;

        const start = new Date(startTime).getTime();
        const thresholdMs = type === 'Repair' ? 48 * 60 * 60 * 1000 : 15 * 60 * 1000;
        const criticalMs = type === 'Repair' ? 8 * 60 * 60 * 1000 : 15 * 60 * 1000;

        const updateTimer = () => {
            const now = new Date().getTime();
            const diffMs = now - start;
            const remainingMs = thresholdMs - diffMs;
            
            // Format HH:mm:ss
            const isNegative = remainingMs < 0;
            const absMs = Math.abs(remainingMs);
            const totalSeconds = Math.floor(absMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const prefix = isNegative ? '-' : '';
            const hStr = String(hours).padStart(2, '0');
            const mStr = String(minutes).padStart(2, '0');
            const sStr = String(seconds).padStart(2, '0');
            setTimerDisplay(`${prefix}${hStr}:${mStr}:${sStr}`);

            // Color Logic
            if (isNegative) {
                if (absMs >= criticalMs) {
                    setColorClass('text-red-500 font-bold'); // Critical (Alihkan)
            } else {
                setColorClass('text-amber-500 font-bold'); // Warning (Ping)
            }
        } else {
            setColorClass('opacity-80 font-bold'); // Safe
        }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [startTime, type]);

    if (!startTime) return null;

    return (
        <span className={`inline-flex items-center ml-1 ${colorClass}`}>
            ({timerDisplay})
        </span>
    );
};

export default SLATimer;
