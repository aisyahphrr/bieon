Fitur UI & Keterkaitan Backend untuk Remote Registration dan Raw Bit Catalog

Ringkasan singkat
- Tujuan: UI menyediakan alur registrasi remote yang menampilkan raw bit secara live saat mode registrasi aktif.
- Prinsip utama: raw bit disimpan sebagai katalog global per `bieonId`, bukan per remote tunggal.
- Prinsip UX: tidak ada auto-suggest. UI hanya menampilkan raw bit yang tertangkap dan user memilih sendiri jenis perangkat serta fungsi kontrolnya.

UX utama (komponen dan perilaku)
- Tombol Register
  - Menjalankan request backend untuk memulai mode registrasi remote.
  - Setelah sukses, UI menampilkan status "Registration active" dan mulai mendengarkan event live.

- Live raw bit stream
  - Setiap raw bit yang berhasil ditangkap tampil langsung di UI.
  - UI tidak perlu mengelompokkan ke perangkat tertentu secara otomatis.
  - Jika raw bit yang sama muncul lagi, UI boleh memperbarui item yang sudah ada dengan `lastSeenAt` dan `captureCount`.

- Raw bit item
  - Minimal tampilkan: `rawSignature`, `rawBitText`, `protocol`, `bitLength`, `sequence`, `sourceRemoteIeee` atau `sourceRemoteId`, `lastSeenAt`.
  - Raw bit harus tetap terlihat sebagai data mentah.
  - Tidak perlu rekomendasi otomatis untuk TV / AC / fan / volume / suhu / speed.

- Mapping / konfigurasi lanjutan
  - Setelah user memilih satu raw bit, UI menyediakan form untuk menetapkan:
    - jenis perangkat: TV, AC, kipas, lampu, speaker, dan kategori lain yang relevan
    - grup fungsi: power, volume, suhu, speed, swing, channel, mute, mode, preset, dan opsi custom lain
    - label atau nama kontrol
  - Ketika user menyimpan, mapping tersebut langsung aktif dan bisa dipakai lagi oleh remote lain dalam `bieonId` yang sama.

- State layar
  - `idle` = belum registrasi
  - `registering` = mode registrasi aktif dan live stream berjalan
  - `captured` = raw bit sudah masuk katalog
  - `mapped` = raw bit sudah diberi jenis perangkat dan fungsi
  - `disabled` = raw bit dinonaktifkan oleh user

Mapping ke backend & MQTT (topik, event, endpoint)
- Topik MQTT yang relevan
  - `bieon/{bieonId}/admin/registration` - backend memicu mode registrasi remote
  - `bieon/{bieonId}/events/registration` - firmware mengirim state mode registrasi
  - `bieon/{bieonId}/events/bit_registration_announce` - firmware mengirim raw bit yang tertangkap

- Backend Socket.IO events
  - `remote_registration_state` - status mode registrasi aktif / selesai
  - `remote_bit_registration` - event raw bit mentah yang baru tertangkap
  - `remote_bit_catalog_updated` - event setelah raw bit dipersist dan katalog diperbarui

- Backend REST API
  - `POST /api/devices/registration/:bieonId/start`
    - Memulai mode registrasi remote.
    - Body opsional: `{ duration?: number, sessionId?: string }`
  - `GET /api/devices/registration/:bieonId/catalog`
    - Mengambil katalog raw bit global per `bieonId`.
    - Query opsional: `activeOnly=true`
  - `PATCH /api/devices/registration/catalog/:catalogId`
    - Memperbarui mapping raw bit.
    - Field yang dapat dikirim: `deviceType`, `controlGroup`, `controlAction`, `controlLabel`, `controlSchema`, `notes`, `isActive`, `captureStatus`

Data model backend yang perlu dipahami UI
- Setiap raw bit disimpan dengan identitas unik berdasarkan signature.
- Jika raw bit yang sama muncul lagi, backend tidak membuat duplikat baru; backend hanya memperbarui `captureCount` dan `lastSeenAt`.
- Field mapping disimpan terpisah dari raw data mentah sehingga raw bit tetap murni dan reusable.

Contoh payload event live
- `remote_registration_state`
  - `{ bieonId, sessionId, state, active, duration, payload, requestedBy, sourceTopic, updatedAt }`

- `remote_bit_registration`
  - `{ bieonId, sessionId, activeSession, payload, catalogItem, receivedAt }`

- `remote_bit_catalog_updated`
  - Sama seperti `remote_bit_registration`, tetapi dipakai setelah backend selesai upsert ke database.

Contoh alur end-to-end
1. User klik tombol Register.
2. Frontend memanggil `POST /api/devices/registration/:bieonId/start`.
3. Backend mem-publish MQTT ke `bieon/{bieonId}/admin/registration`.
4. Firmware mengaktifkan mode registrasi dan mengirim `events/registration`.
5. Saat tombol remote ditekan, firmware mengirim `events/bit_registration_announce`.
6. Backend menyimpan raw bit ke katalog global dan mengirim Socket.IO event ke UI.
7. UI menampilkan raw bit secara live.
8. User memilih raw bit tersebut, lalu menetapkan jenis perangkat dan fungsi kontrol.
9. Backend menyimpan mapping dan item siap dipakai oleh remote lain dalam `bieonId` yang sama.

Catatan implementasi UI
- Jangan membuat auto-suggest untuk jenis perangkat atau fungsi kontrol.
- Gunakan state transisional yang jelas supaya user tahu kapan registrasi masih aktif.
- Karena katalog bersifat global per `bieonId`, UI harus menampilkan daftar yang sama walau user berpindah remote dalam sistem yang sama.
- Kalau ada raw bit yang sudah dipetakan, tampilkan badge status seperti `mapped` atau `active` supaya user tahu item itu sudah siap dipakai.

Pertanyaan desain yang sengaja belum diputuskan backend
- Tampilan visual form mapping raw bit: dapat memakai modal, drawer, atau panel samping.
- Urutan kontrol per device type: misalnya TV menampilkan power, volume, channel; AC menampilkan power, suhu, speed, swing.
- Penamaan final untuk badge status dan empty state.

Dokumen ini sengaja tidak memaksa perubahan UI lama. Tujuannya hanya menjadi kontrak agar tim UI/FE bisa membangun halaman remote registration tanpa ambigu.