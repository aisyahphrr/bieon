# BIEON Final Verification Checklist

## Sudah Final Di Kode

- [x] UI card join sudah memakai data live dari backend/socket, tanpa mock data.
- [x] PDM dibaca dari data live history/telemetry dan ditampilkan di dashboard.
- [x] Command publish tetap lewat `bieon/<bieonId>/admin/command` dengan payload terstruktur.
- [x] Integritas ownership dijaga lewat filter `owner`, `technician session`, `bieonId`, dan `device_ieee`.
- [x] `log/system` dipersist ke model `SystemLog` selain di-emit ke socket.
- [x] Telemetry Zigbee dikunci ke `bieonId + device_ieee` agar tidak tertukar.
- [x] Publish legacy `config/device-map` dari controller sudah dihapus dari jalur aktif.
- [x] Topic aktif sudah diringkas ke schema Bieon yang disepakati.

## Masih Perlu Uji Fisik / Runtime

- [ ] Join nyata di ESP-A dan ESP-B sudah diuji dengan perangkat fisik.
- [ ] Tidak ada spam/state loop/watchdog saat trafik nyata dan reconnect MQTT/UART.
- [ ] Data PDM, telemetry, dan system log muncul konsisten di UI saat perangkat fisik aktif.
- [ ] Command dari UI benar-benar menyalakan/mematikan perangkat fisik yang tepat.
- [ ] Sinkronisasi ownership di skenario multi-user dan multi-hub sudah divalidasi di lapangan.

## Catatan

- Halaman admin diagnostics sudah dipindahkan dari mock ke live data snapshot + socket stream.
- Data dashboard tetap mengikuti data backend asli yang tersedia pada endpoint history.
