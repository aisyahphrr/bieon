const API_URL = 'http://localhost:5000/api';
const MOCK_USER_ID = '69e1d911d44d1b609d335769'; // ID riil superadmin@bieon.com

async function runTest() {
    console.log('🚀 Memulai Simulasi Uji Coba API BIEON...\n');

    try {
        // 1. Test Setup Hubs
        console.log('--- 1. Mendaftarkan BIEON System & 3 Hub ---');
        const setupRes = await fetch(`${API_URL}/hubs/setup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bieonId: `BIEON-TEST-${Date.now()}`, // ID random agar unik tiap test
                userId: MOCK_USER_ID,
                totalHubs: 3
            })
        });
        const setupData = await setupRes.json();
        if (!setupRes.ok) throw new Error(setupData.message);
        
        console.log('✅ Berhasil:', setupData.message);
        const hubId = setupData.hubs[0]._id;
        console.log('ℹ️ Menggunakan Hub ID:', hubId, 'untuk test selanjutnya.\n');

        // 2. Test Discover Device
        console.log('--- 2. Mendeteksi Perangkat Baru (Discovered) ---');
        const discoverRes = await fetch(`${API_URL}/kendaliperangkat/discover`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hubId: hubId,
                category: 'Sensor',
                type: 'Kualitas Air',
                ownerId: MOCK_USER_ID
            })
        });
        const discoverData = await discoverRes.json();
        if (!discoverRes.ok) throw new Error(discoverData.message);

        console.log('✅ Berhasil:', discoverData.message);
        const deviceId = discoverData.device._id;
        console.log('ℹ️ Device ID:', deviceId, '\n');

        // 3. Test Configure Device
        console.log('--- 3. Mengkonfigurasi Perangkat (Thresholds) ---');
        const configRes = await fetch(`${API_URL}/kendaliperangkat/configure/${deviceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Sensor Kolam Ikan Lele',
                location: 'Samping Saung',
                thresholds: {
                    ph: 7.5,
                    turbidity: 20,
                    tds: 500,
                    temperature: 27
                },
                controlMethod: 'Lingkungan',
                environmentAspect: 'Kualitas Air'
            })
        });
        const configData = await configRes.json();
        if (!configRes.ok) throw new Error(configData.message);

        console.log('✅ Berhasil:', configData.message);
        console.log('📊 Data Disimpan di DB:', JSON.stringify(configData.device, null, 2), '\n');

        console.log('🎉 SEMUA TEST SELESAI DENGAN SUKSES!');
        console.log('Sekarang silakan cek collection "kendaliperangkat" di Database Client Anda.');

    } catch (error) {
        console.error('❌ ERROR SAAT TEST:', error.message);
        console.log('\nInformasi Tambahan:');
        console.log('1. Pastikan "npm run dev" masih menyala di terminal sebelah.');
        console.log('2. Pastikan database MongoDB Atlas Anda aktif.');
    }
}

runTest();
