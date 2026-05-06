import React from 'react';

const TermsModal = ({ 
    show, 
    onClose, 
    onAccept, 
    modalCheckboxChecked, 
    setModalCheckboxChecked, 
    hasScrolledToBottom, 
    handleScrollTerms 
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="px-8 pt-8 pb-4 border-b border-gray-100">
                    <h2 className="text-[22px] font-bold text-[#009b7c] mb-1">SYARAT DAN KETENTUAN PENGGUNAAN</h2>
                    <h3 className="text-[15px] font-bold text-[#111827]">Layanan BIEON-Smart Green Living Monitoring System</h3>
                </div>

                {/* Modal Body / Scrollable */}
                <div
                    onScroll={handleScrollTerms}
                    className="px-8 py-5 overflow-y-auto flex-1 custom-scrollbar text-[13.5px] text-gray-600 leading-relaxed pr-6"
                >
                    <p className="mb-6 text-[#009b7c] font-semibold">Date: 6 April 2026</p>
                    
                    <h4 className="font-bold text-gray-800 mb-1 mt-6">1. Pendahuluan</h4>
                    <p className="mb-4">Selamat datang di BIEON Smart Green Living Monitoring System. Syarat dan Ketentuan ini adalah hukum antara Anda (selanjutnya disebut "pengguna") dan PT Matra Kreasi Mandiri (selanjutnya disebut "perusahaan") selaku pengembang dan penyedia sistem BIEON.</p>
                    <p className="mb-4">Dengan mengakses dashboard web BIEON, mengunduh, dan menggunakan perangkat keras BIEON yang terpasang di properti Anda, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh isi syarat dan ketentuan ini. Jika Anda tidak setuju, Anda dilarang menggunakan layanan kami ini.</p>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">2. Definisi</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-2">
                        <li><strong>BIEON:</strong> sistem integrasi Internet of Things (IoT) yang mencakup perangkat keras (Master, Hub-Node, Smart Device) dan perangkat lunak (Dashboard Web) untuk monitoring berbagai aspek.</li>
                        <li><strong>Pengguna (Homeowner):</strong> Individu sah yang memiliki akses ke dashboard BIEON untuk memantau dan mengontrol perangkat di rumah mereka.</li>
                        <li><strong>Teknisi:</strong> staf internal Perusahaan yang berwenang melakukan diagnostik, konfigurasi jarak jauh, dan penanganan keluhan pada sistem pengguna.</li>
                    </ul>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">3. Penggunaan Layanan dan Keamanan Akun</h4>
                    <ol className="list-[lower-alpha] pl-5 mb-4 space-y-2">
                        <li><strong>Akses akun:</strong> Pengguna wajib menjaga kerahasiaan username, kata sandi. Segala aktivitas aktuasi (seperti menyalakan/mematikan perangkat) yang dilakukan dari akun Pengguna adalah tanggung jawab penuh Pengguna.</li>
                        <li><strong>Penggunaan wajar:</strong> Layanan ini hanya boleh digunakan untuk tujuan pemantauan dan manajemen sistem cerdas secara wajar. Pengguna dilarang keras:
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Melakukan rekayasa balik (reverse engineering) terhadap perangkat keras ESP32, jaringan lokal (ESP-NOW), atau protokol MQTT BIEON</li>
                                <li>Mencoba membebani server atau mencari celah keamanan pada dashboard web BIEON</li>
                                <li>Menggunakan perangkat BIEON untuk tujuan ilegal atau membahayakan pihak lain.</li>
                            </ul>
                        </li>
                    </ol>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">4. Pengumpulan dan Penggunaan Data (Privasi)</h4>
                    <p className="mb-2">Untuk menjalankan fungsinya, sistem BIEON secara terus-menerus mengumpulkan dan memproses data dari properti Anda, yang meliputi namun tidak terbatas pada:</p>
                    <ul className="list-disc pl-5 mb-4 space-y-2">
                        <li><strong>Data Penggunaan Energi Listrik:</strong> Tegangan, arus, beban (Load), Konsumsi daya (kWh)</li>
                        <li><strong>Data Lingkungan:</strong> Kualitas udara (suhu, dan kelembapan), Kualitas air (pH, padatan terlarut, suhu air, kekeruhan).</li>
                        <li><strong>Data Keamanan & Log:</strong> status pintu terbuka/tertutup, pergerakan (motion), serta riwayat On/off alat. Data ini digunakan semata-mata untuk menampilkan grafik di dashboard Anda, perhitungan estimasi biaya, penanganan troubleshooting oleh Teknisi, dan peningkatan kinerja sistem.</li>
                    </ul>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">5. Batasan Tanggung Jawab</h4>
                    <p className="mb-2">Klausul berikut sangat penting untuk dipahami terkait sifat perangkat IoT:</p>
                    <ol className="list-[lower-alpha] pl-5 mb-4 space-y-2">
                        <li><strong>Ketergantungan Eksternal:</strong> Kinerja Layanan BIEON sangat bergantung pada pasokan listrik PLN, stabilitas koneksi Internet di area Anda, serta jangkauan router Wi-Fi lokal. Kami tidak bertanggung jawab atas keterlambatan notifikasi, hilangnya log data sensor, atau kegagalan aktuasi perangkat jika terjadi gangguan pada faktor-faktor eksternal tersebut.</li>
                        <li><strong>Bukan alat keselamatan Mutlak:</strong> Fitur peringatan keamanan BIEON (seperti sensor kebocoran gas dan intrusi pintu), dirancang sebagai system peringatan dini (early warning system), bukan sebagai pengganti layanan tanggap darurat professional (polisi, atau medis). Kami tidak memberikan jaminan mutlak bahwa layanan akan mencegah bahaya kebakaran, pencurian, atau kerusakan properti.</li>
                        <li><strong>Kerugian Materiil:</strong> PT Matra Kreasi Mandiri dibebaskan dari segala tuntutan ganti rugi atas hilangnya nyawa, cedera, atau kerusakan properti yang diakibatkan oleh gagal berfungsinya perangkat keras (hardware failure), gangguan server, atau kelalaian Pengguna dalam merespons sistem peringatan BIEON.</li>
                    </ol>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">6. Pemeliharaan dan Pengaduan</h4>
                    <ol className="list-[lower-alpha] pl-5 mb-4 space-y-2">
                        <li>Pengguna berhak mengajukan perbaikan melalui fitur Tiket Pengaduan di dashboard apabila mendapati status Offline atau anomali pembacaan sensor.</li>
                        <li>Kami berhak menugaskan Teknisi untuk melakukan pemeriksaan secara visual melalui dashboard global atau mengubah parameter kalibrasi jaringan klien guna keperluan troubleshooting, tanpa mengintervensi atau menyalakan/mematikan alat pribadi Pengguna tanpa izin.</li>
                        <li>Kami sewaktu-waktu dapat melakukan pemeliharaan (maintenance) server atau Over-The-Air (OTA) update pada perangkat lokal, yang mungkin mengakibatkan downtime sementara pada Layanan.</li>
                    </ol>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">7. Pemutusan Akses</h4>
                    <p className="mb-4">Kami, melalui Super Admin, berhak melakukan penangguhan atau pemutusan akses akun Pengguna secara sepihak dan tanpa pemberitahuan sebelumnya apabila ditemukan indikasi kuat pelanggaran terhadap Syarat dan Ketentuan ini.</p>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">8. Hukum yang Berlaku</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-2">
                        <li>Keefektifan, penjelasan, perubahan, pelaksanaan, dan penyelesaian perselisihan dari Perjanjian tunduk pada hukum Indonesia. Jika tidak ada undang-undang dan peraturan yang relevan, referensi ke praktik bisnis internasional umum dan (atau) praktik industri harus dibuat.</li>
                        <li>Perselisihan yang timbul dari atau sehubungan dengan Perjanjian dapat diselesaikan oleh Anda dan PT Matra Kreasi Mandiri Smart Living melalui musyawarah atau jika tidak mencapai persetujuan, maka dapat diajukan ke Pengadilan Indonesia di mana Perjanjian ditandatangani untuk ajudikasi.</li>
                        <li>Ketika suatu ketentuan Perjanjian ini dinilai tidak sah oleh Pengadilan Indonesia, hal itu tidak akan mempengaruhi keefektifan ketentuan lain atau bagian apa pun darinya, Anda dan BIEON Smart Living akan melakukan ketentuan yang sah dengan itikad baik.</li>
                        <li>Perjanjian ini ditandatangani di Indonesia.</li>
                    </ul>

                    <p className="mb-4 pt-16 pb-4 text-center font-medium">Akhir dari Syarat dan Ketentuan.</p>
                </div>

                {/* Modal Footer */}
                <div className="px-8 py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 rounded-b-xl">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={modalCheckboxChecked}
                            onChange={(e) => setModalCheckboxChecked(e.target.checked)}
                            disabled={!hasScrolledToBottom}
                            className="w-[18px] h-[18px] rounded-sm border-gray-300 text-[#009b7c] focus:ring-[#009b7c] disabled:opacity-50 transition-colors"
                        />
                        <span className={`text-[13px] font-bold transition-colors ${hasScrolledToBottom ? 'text-[#111827] group-hover:text-[#009b7c]' : 'text-gray-400'}`}>
                            I confirm that I have read and accept the terms and conditions.
                        </span>
                    </label>

                    <div className="flex gap-2 shrink-0 mt-4 sm:mt-0">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-[#009b7c] font-bold text-[13.5px] bg-transparent hover:bg-[#009b7c]/10 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={!modalCheckboxChecked || !hasScrolledToBottom}
                            onClick={onAccept}
                            className={`px-8 py-2.5 rounded-lg font-bold text-[13.5px] transition-all ${modalCheckboxChecked && hasScrolledToBottom
                                ? 'bg-[#009b7c] hover:bg-[#008268] text-white shadow-sm'
                                : 'bg-[#009b7c]/40 text-white cursor-not-allowed'
                                }`}
                        >
                            Accept
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
