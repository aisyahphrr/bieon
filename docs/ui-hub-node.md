Fitur UI & Keterkaitan Backend untuk Perubahan Mekanisme Hub Node

Ringkasan singkat
- Tujuan: UI menyediakan alur "Add Hub Node" dan "Remove Hub Node" yang memanfaatkan mekanisme open_join / lifecycle / leave yang sudah tersedia di firmware dan backend.

UX utama (komponen dan perilaku)
- Add Hub modal
  - Tombol: "Start Add Hub" yang memanggil backend untuk publish `open_join` mode `add_hub_node` (hub_only=true).
  - Menampilkan status: "Scanning…", countdown waktu hub-only window, dan hasil kandidat (jika ada).
  - Jika backend/firmware memilih kandidat, tampilkan toast "Hub added" dan perbarui daftar hub.
  - Jika timeout tanpa kandidat, tampilkan toast "Hub add failed".

- Scan / Progress view
  - Menampilkan progress bar atau countdown dari durasi hub-only.
  - Menampilkan log singkat per-event (device discovered, interview progress).

- Candidate details (opsional)
  - Tampilkan kandidat yang ditemukan (ieee, model/manuf, interviewed:true/false, timestamp).
  - Tampilkan alasan pemilihan ringkas (interview selesai / recency / random fallback).

- Hub list (daftar hub di bieon)
  - Setiap item: hubId, label/nama, last_seen, firmware_version, status (online/offline/removing).
  - Tombol "Remove" yang memanggil API backend untuk meminta leave pada hub.
  - Tampilkan status sementara "Removing…" sampai leave terkonfirmasi oleh backend via lifecycle/device-removed event.

- Notifikasi / Toasts
  - `hub_added`: konfirmasi sukses, sertakan hubId dan optional metadata.
  - `hub_add_failed`: konfirmasi timeout / gagal.
  - `system_log` / `join_state` / `device_discovered`: tampilkan sebagai info/log untuk debugging pengguna.

Mapping ke backend & MQTT (topik, event, endpoint)
- Topik MQTT yang relevan
  - `bieon/{bieonId}/admin/open_join` — payload: `{ mode: 'add_hub_node', hub_only: true, timeout_s: 60 }` (UI memicu backend yang mem-publish).
  - `bieon/{bieonId}/hub/{hubId}/lifecycle` — payloads: `{ event: 'hub_added', ... }` atau `{ event: 'hub_add_failed', ... }`. Backend menyimpan hub dan men-emit socket events.
  - `bieon/{bieonId}/admin/leave` — payload: `{ command: 'leave_device', device_ieee: '...', remove_children:1 }` (dipakai untuk hapus hub).

- Backend Socket.IO events (yang harus di-subscribe UI)
  - `hub_added` — server mengirim saat lifecycle `hub_added` diterima dan hub di-upsert.
  - `hub_add_failed` — saat firmware mengirim event gagal atau backend timeout.
  - `device_discovered` / `join_state` — optional untuk menampilkan progress scan/interview.
  - `system_log` — optional untuk menampilkan pesan internal/diagnostic.

- Backend REST API (disarankan)
  - POST `/api/bieon/:bieonId/hubs/open_join` — body: `{ timeout_s?: number }`. Handler memanggil `publishOpenJoin(bieonId, {mode:'add_hub_node', hub_only:true, timeout_s})`.
  - POST `/api/bieon/:bieonId/hubs/:hubId/leave` — body: `{ remove_children?: boolean }`. Handler memanggil `publishLeave(bieonId, device_ieee, { remove_children })`.
  - GET `/api/bieon/:bieonId/hubs` — daftar hub (existing API jika ada) untuk refresh UI.

Integrasi & Flow rekomendasi
- Add Hub flow
  1. User buka `Add Hub` modal, tekan `Start Add Hub` → frontend panggil `POST /api/bieon/:bieonId/hubs/open_join`.
  2. Backend publish `open_join` ke gateway (ESP‑B → ESP‑A membuka hub-only window).
  3. Firmware memilih kandidat dan mengirim lifecycle `hub_added` atau `hub_add_failed` ke MQTT.
  4. Backend menerima lifecycle, upsert Hub, lalu emit Socket.IO `hub_added`/`hub_add_failed` ke UI.
  5. UI menutup modal dan refresh daftar hub.

- Remove Hub flow (gunakan mekanisme leave yang ada)
  1. User klik "Remove" di daftar hub → frontend panggil `POST /api/bieon/:bieonId/hubs/:hubId/leave`.
  2. Backend memanggil `publishLeave(bieonId, device_ieee, { remove_children:1 })`.
  3. ESP‑B/ESP‑A melakukan leave; saat selesai firmware/backend akan mem-publish lifecycle/device removal events.
  4. Backend menerima konfirmasi dan menghapus/menandai Hub sebagai removed; emit Socket.IO update ke UI.

Offline & resiliency notes
- ESP‑B buffer: saat MQTT down, lifecycle events di-buffer ke SD dan direplay saat koneksi kembali. UI tetap harus mengandalkan backend Socket.IO (yang akan dikirim ulang saat replay).
- UI harus tampilkan indikasi "gateway offline / buffering" bila backend melaporkan broker/gateway down.

UI Implementation Notes (singkat)
- Subscribe ke Socket.IO events: `hub_added`, `hub_add_failed`, `device_discovered`, `join_state`, `system_log`.
- Gunakan polling atau server-sent refresh untuk hub list fallback bila socket disconnect.
- Tampilkan state transisional (Scanning, Removing) untuk mencegah double-actions.

Pertanyaan keputusan desain
- Apakah UI butuh menampilkan kandidat yang ditolak (untuk debugging)? Jika ya, backend perlu meneruskan `device_discovered` payloads ke Socket.IO.
- Apakah ingin UX optimistis (mark hub as removing segera setelah request) atau menunggu konfirmasi? Rekomendasi: mark as `Removing` dan revert jika gagal.

--
Dokumen ini singkat; mau saya tambahkan contoh payload JSON dan contoh handler Express sederhana?
