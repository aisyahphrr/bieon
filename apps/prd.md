# Technical Specification - Auth Cloud Flow

## Purpose
Dokumen ini menjelaskan alur auth antara Master Zigbee, Master MQTT, dan cloud, termasuk topic MQTT, struktur payload JSON, dan struktur data MongoDB untuk auth.

## Ringkasan Flow
1. Device mengirim Device Announce ke jaringan Zigbee.
2. Master Zigbee membuat runtime identity dari IEEE, short address, dan simple descriptor.
3. Master Zigbee mengirim `auth_request` ke Master MQTT melalui UART.
4. Master MQTT memeriksa auth cache lokal.
5. Jika cache miss, Master MQTT publish `auth_request` ke cloud.
6. Cloud memeriksa registry dan mengembalikan `auth_response`.
7. Master MQTT meneruskan keputusan ke Master Zigbee.
8. Jika `allow`, Master Zigbee lanjut bind, configure reporting, dan telemetry.
9. Jika `block`, Master Zigbee mengirim leave request.

## Identity Rules
- `device_ieee` adalah identity utama yang stabil.
- `device_id` dipakai untuk routing internal dan identitas operasional.
- `device_profile` adalah tipe device utama yang dipakai cloud untuk klasifikasi.
- `model_id` adalah field legacy/compatibility.
- `alias` dibuat dari `device_profile` + suffix 4 digit terakhir IEEE.
- Jika `hub_ieee` belum diketahui, gunakan nilai fallback yang disepakati di firmware.

## MQTT Topics
### Auth Request
`bieon/<master_ieee>/auth/request`

### Auth Response
`bieon/<master_ieee>/auth/response`

### System Log
`bieon/<master_ieee>/logging/system`

### Telemetry
`bieon/<master_ieee>/<hub_ieee>/<alias>`

### Command Smart Plug
Jika command masih memakai topic statis, gunakan topic yang disepakati di Master MQTT. Jika sudah dinamis, gunakan pola yang mengikuti identity device.

## Payload JSON

### auth_request
Field yang wajib diproses cloud:
- `type`
- `master_ieee`
- `hub_ieee`
- `device_ieee`
- `device_id`
- `device_profile`
- `alias`
- `cached`
- `ts`

Field legacy yang tetap boleh diterima:
- `device_name`
- `model_id`

Contoh:
```json
{
  "type": "auth_request",
  "master_ieee": "404ccafffe513434",
  "hub_ieee": "404ccafffe513434",
  "device_ieee": "a4c1380d4841ffff",
  "device_id": "dev_ffff",
  "device_name": "",
  "device_profile": "plug_power",
  "model_id": "",
  "alias": "plug_power_FFFF",
  "cached": false,
  "ts": 1778046579
}
```

### auth_response
Field yang wajib diproses Zigbee dan MQTT:
- `type`
- `decision`
- `master_ieee`
- `device_ieee`
- `device_id`
- `device_profile`
- `alias`
- `ts`

Field legacy yang tetap boleh diterima:
- `device_name`
- `model_id`

Contoh allow:
```json
{
  "type": "auth_response",
  "decision": "allow",
  "master_ieee": "404ccafffe513434",
  "device_ieee": "a4c1380d4841ffff",
  "device_id": "dev_ffff",
  "device_name": "",
  "device_profile": "plug_power",
  "model_id": "",
  "alias": "plug_power_FFFF",
  "ts": 1778046580
}
```

Contoh block:
```json
{
  "type": "auth_response",
  "decision": "block",
  "master_ieee": "404ccafffe513434",
  "device_ieee": "a4c1380d4841ffff",
  "device_id": "unknown",
  "device_profile": "UNKNOWN",
  "model_id": "UNKNOWN",
  "alias": "UNKNOWN_FFFF",
  "ts": 1778046580
}
```

## Cloud Decision Logic
1. Normalize `device_ieee` dan `master_ieee`.
2. Lookup registry by `device_ieee`.
3. If found and status is approved, return `allow`.
4. If found but pending review, return `block` or `pending` according to policy.
5. If not found, create/update auth record and return `block` or `pending`.
6. Use `device_profile` as the primary type for policy and grouping.
7. Use `model_id` only as a compatibility fallback.

## MongoDB Structure
### Collection: auth_events
Collection ini menyimpan request dan response auth dalam satu alur.

Contoh document:
```json
{
  "_id": "ObjectId(...)",
  "type": "auth_request",
  "status": "pending",
  "decision": "",
  "master_ieee": "404ccafffe513434",
  "hub_ieee": "404ccafffe513434",
  "device_ieee": "a4c1380d4841ffff",
  "device_id": "dev_ffff",
  "device_name": "",
  "device_profile": "plug_power",
  "model_id": "",
  "alias": "plug_power_FFFF",
  "cached": false,
  "source": "zigbee",
  "created_at": "2026-05-06T12:00:00Z",
  "updated_at": "2026-05-06T12:00:00Z",
  "ts": 1778046579
}
```

#### Field Meaning
- `type`: auth_request atau auth_response.
- `status`: pending, allow, block, or rejected.
- `decision`: final cloud decision.
- `source`: zigbee, mqtt, or cloud worker.
- `device_profile`: primary device classification.
- `model_id`: legacy classification.
- `alias`: short identity for topic and display.

#### Recommended Indexes
- Unique index: `master_ieee + device_ieee`
- Index: `device_ieee`
- Index: `alias`
- Index: `status`
- Index: `ts`
- Compound index: `master_ieee + status + ts`

### Collection: device_registry
Jika registry dipisahkan dari event, gunakan collection ini untuk device master data.

Contoh document:
```json
{
  "device_ieee": "a4c1380d4841ffff",
  "master_ieee": "404ccafffe513434",
  "hub_ieee": "404ccafffe513434",
  "device_id": "plug_01",
  "device_name": "Smart Plug",
  "device_profile": "SMART_PLUG",
  "model_id": "SMART_PLUG",
  "alias": "SMART_PLUG_C1A4",
  "status": "authorized",
  "last_decision": "allow",
  "last_seen": 1778046580,
  "updated_at": "2026-05-06T12:00:00Z"
}
```

## Suggested Cloud Contract
- Cloud harus menerima `device_profile` sebagai field utama.
- Cloud harus tetap menerima `model_id` untuk backward compatibility.
- Cloud harus mengembalikan `device_profile` di `auth_response`.
- Cloud tidak boleh menggantung keputusan auth hanya pada `model_id`.
- Cloud should treat `alias` as a presentation and topic helper, not as the primary identity.

## Dashboard Subscribe Pattern
- Semua auth request: `bieon/+/auth/request`
- Semua auth response: `bieon/+/auth/response`
- System log: `bieon/+/logging/system`
- Semua telemetry: `bieon/+/+/+`

## Important Notes
- Auth flow sekarang tidak menunggu Basic Model Identifier.
- Simple descriptor dipakai untuk membangun `device_profile`.
- Jika simple descriptor belum cukup spesifik, firmware memakai fallback `zigbee_device`.
- Setelah cloud mengirim `allow`, Master Zigbee harus langsung lanjut bind dan reporting.
- Jika `block`, device harus dilepas dari jaringan atau ditandai rejected sesuai policy.

## Example Decision Table
| device_profile | registry status | decision | status |
|---|---|---:|---|
| SMART_PLUG | approved | allow | authorized |
| WATER_SENSOR | pending | block | pending |
| UNKNOWN | not found | block | rejected |

## Summary
Dokumen ini menjadi referensi utama untuk auth cloud: topic, payload, decision logic, dan penyimpanan MongoDB. Untuk implementasi baru, gunakan `device_profile` sebagai identitas klasifikasi utama dan `device_ieee` sebagai kunci device.