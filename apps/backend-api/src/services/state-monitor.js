const KendaliPerangkat = require('../models/KendaliPerangkat');
const Device = require('../models/Device');

/**
 * State Monitor Service
 * Periodically checks for stale or orphan devices based on lastSeen timestamp.
 */
const runStateMonitoring = async () => {
    console.log('[StateMonitor] Running periodic check...');
    try {
        const now = new Date();
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60000);

        // 1. Detect STALE devices (Online -> Stale)
        // Devices that haven't been seen for > 30 minutes but are still in AUTHORIZED/Active state
        const staleResult = await KendaliPerangkat.updateMany(
            {
                lastSeen: { $lt: thirtyMinutesAgo },
                lifecycleState: 'AUTHORIZED',
                status: { $ne: 'STALE' }
            },
            {
                $set: { 
                    lifecycleState: 'STALE',
                    status: 'STALE'
                }
            }
        );

        if (staleResult.modifiedCount > 0) {
            console.log(`[StateMonitor] Marked ${staleResult.modifiedCount} devices as STALE`);
        }

        // 2. Detect ORPHAN devices (Stale -> Orphan)
        // Devices that haven't been seen for > 7 days
        const orphanResult = await KendaliPerangkat.updateMany(
            {
                lastSeen: { $lt: sevenDaysAgo },
                lifecycleState: 'STALE'
            },
            {
                $set: { 
                    lifecycleState: 'ORPHAN',
                    status: 'ORPHAN'
                }
            }
        );

        if (orphanResult.modifiedCount > 0) {
            console.log(`[StateMonitor] Marked ${orphanResult.modifiedCount} devices as ORPHAN`);
        }

        // Also sync the Device model (if used)
        await Device.updateMany(
            { lastSeen: { $lt: thirtyMinutesAgo }, lifecycleState: 'AUTHORIZED' },
            { $set: { lifecycleState: 'STALE', status: 'STALE' } }
        );

    } catch (err) {
        console.error('[StateMonitor] Error during check:', err.message);
    }
};

// Start monitoring every 1 minute
const startMonitoring = (intervalMs = 60000) => {
    runStateMonitoring(); // Run once immediately
    setInterval(runStateMonitoring, intervalMs);
};

module.exports = { startMonitoring };
