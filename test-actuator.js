const API_URL = 'http://localhost:5000/api';
const MOCK_USER_ID = '662363717283627192abcdef';

async function runActuatorTest() {
    console.log('🎮 Memulai Simulasi Uji Coba ACTUATOR BIEON...\n');

    try {
        // 0. Siapkan Hub dulu
        const setupRes = await fetch(`${API_URL}/hubs/setup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bieonId: `BIEON-ACT-${Math.floor(Math.random() * 1000)}`,
                userId: MOCK_USER_ID,
                hubCount: 1
            })
        });
        const setupData = await setupRes.json();
        const hubId = setupData.hubs[0]._id;

        // --- SKENARIO 1: SMART PLUG (KONDISI LINGKUNGAN) ---
        console.log('--- 1. Testing Smart Plug (Metode: Lingkungan) ---');
        
        // Discover
        const discPlug = await fetch(`${API_URL}/kendaliperangkat/discover`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hubId,
                category: 'Control Actuator System',
                type: 'Smart Plug',
                ownerId: MOCK_USER_ID
            })
        });
        const plugData = await discPlug.json();
        
        // Configure
        const confPlug = await fetch(`${API_URL}/kendaliperangkat/configure/${plugData.device._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Lampu Teras Otomatis',
                location: 'Teras Depan',
                controlMethod: 'Lingkungan',
                environmentAspect: 'Keamanan' // Berdasarkan aspek keamanan (motion/door)
            })
        });
        const resPlug = await confPlug.json();
        console.log('✅ Smart Plug Tersimpan:', resPlug.device.name, `[Metode: ${resPlug.device.controlMethod} - ${resPlug.device.environmentAspect}]\n`);


        // --- SKENARIO 2: SMART SWITCH (JADWAL OTOMATIS) ---
        console.log('--- 2. Testing Smart Switch (Metode: Jadwal) ---');

        // Discover
        const discSwitch = await fetch(`${API_URL}/kendaliperangkat/discover`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hubId,
                category: 'Control Actuator System',
                type: 'Smart Switch',
                ownerId: MOCK_USER_ID
            })
        });
        const switchData = await discSwitch.json();

        // Configure
        const confSwitch = await fetch(`${API_URL}/kendaliperangkat/configure/${switchData.device._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Pompa Air Jadwal',
                location: 'Taman',
                controlMethod: 'Jadwal' // Berdasarkan jadwal waktu
            })
        });
        const resSwitch = await confSwitch.json();
        console.log('✅ Smart Switch Tersimpan:', resSwitch.device.name, `[Metode: ${resSwitch.device.controlMethod}]\n`);

        console.log('🎉 TEST ACTUATOR SELESAI!');
        console.log('Silakan cek di Database Client Anda untuk melihat transaksinya.');

    } catch (error) {
        console.error('❌ ERROR:', error.message);
    }
}

runActuatorTest();
