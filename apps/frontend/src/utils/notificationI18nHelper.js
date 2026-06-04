/**
 * notificationI18nHelper.js
 * ─────────────────────────────────────────────────────────────────────
 * Utility terpusat untuk lokalisasi notifikasi BIEON.
 * Digunakan oleh NotificationPopup.jsx dan HomeownerDashboard.jsx.
 *
 * Strategi:
 * 1. Jika notif memiliki `messageKey` → langsung pakai t(messageKey, metadata)
 * 2. Jika tidak, jalankan regex matcher terhadap string legacy dari backend
 * 3. Fallback ke teks asli jika tidak ada pola yang cocok
 * ─────────────────────────────────────────────────────────────────────
 */

// ─── TITLE MATCHERS ────────────────────────────────────────────────────────────

/**
 * Melokalisasi judul notifikasi berdasarkan pattern matching.
 * @param {string} text  - Judul asli dari backend
 * @param {string} category - Kategori notifikasi
 * @param {function} t  - Fungsi t() dari react-i18next
 * @returns {string}
 */
export function getLocalizedTitle(text, category, t) {
  if (!text) return getLocalizedCategory(category || '', t);
  const lower = text.toLowerCase();

  // Complaint / Ticket flow
  if (lower.includes('terkirim') || lower.includes('complaint sent')) return t('notification.title.complaint_sent', text);
  if (lower.includes('tiket pengaduan baru') || lower.includes('new complaint ticket')) return t('notification.title.new_complaint_ticket', text);
  if (lower.includes('mulai memproses') || lower.includes('started processing') || lower.includes('technician started')) return t('notification.title.tech_processing', text);
  if (lower.includes('perbaikan selesai') || lower.includes('repair completed') || lower.includes('repair finished')) return t('notification.title.repair_finished', text);
  if (lower.includes('pekerjaan selesai') || lower.includes('job finished')) return t('notification.title.job_finished', text);
  if (lower.includes('pengaduan ditolak') || lower.includes('complaint rejected')) return t('notification.title.complaint_rejected', text);
  if (lower.includes('tiket dibatalkan') || lower.includes('ticket cancelled') || lower.includes('dibatalkan')) return t('notification.title.ticket_cancelled', text);
  if (lower.includes('update perbaikan') || lower.includes('repair update')) return t('notification.title.repair_update', text);
  if (lower.includes('permintaan data log') || lower.includes('log data request') || lower.includes('log request')) return t('notification.title.log_request', text);
  if (lower.includes('akses log diberikan') || lower.includes('log access granted') || lower.includes('log granted')) return t('notification.title.log_granted', text);
  if (lower.includes('akses log ditolak') || lower.includes('log access denied') || lower.includes('log denied')) return t('notification.title.log_denied', text);
  if (lower.includes('tugas perbaikan baru') || lower.includes('new task') || lower.includes('task assigned')) return t('notification.title.new_task', text);
  if (lower.includes('teknisi ditugaskan') || lower.includes('technician assigned') || lower.includes('tech assigned')) return t('notification.title.tech_assigned', text);
  // SLA / Overdue titles (order matters - more specific first)
  if (lower.includes('sla overdue perbaikan') || lower.includes('sla repair overdue')) return t('notification.title.sla_overdue_repair', text);
  if (lower.includes('kritis: sla') || lower.includes('critical: sla')) return t('notification.title.sla_overdue', text);
  if (lower.includes('overdue') || lower.includes('sla overdue') || lower.includes('keterlambatan')) return t('notification.title.sla_overdue', text);
  if (lower.includes('anggaran diperbarui') || lower.includes('budget updated')) return t('notification.title.budget_updated', text);
  if (lower.includes('batas peringatan diperbarui') || lower.includes('peringatan anggaran diperbarui') || lower.includes('threshold updated') || lower.includes('warning limit updated')) return t('notification.title.threshold_updated', text);
  if (lower.includes('terlalu rendah') || lower.includes('batas anggaran rendah') || lower.includes('low budget')) return t('notification.title.low_budget', text);
  if (lower.includes('kontrol perangkat') || lower.includes('device control')) return t('notification.title.device_control', text);

  // IoT Sensor / System
  if (lower.includes('sensor gerak') || lower.includes('motion sensor') || lower.includes('gerak mencurigakan')) return t('notification.title.security_motion', text);
  if (lower.includes('ph air kritis') || lower.includes('critical water ph') || lower.includes('water ph critical')) return t('notification.title.water_ph_critical', text);
  if (lower.includes('suhu terlalu panas') || lower.includes('temperature too high') || lower.includes('temp high')) return t('notification.title.temp_high_warning', text);
  if (lower.includes('peringatan anggaran') || lower.includes('budget warning') || lower.includes('budget limit warning')) return t('notification.title.budget_limit_warning', text);
  if (lower.includes('konfirmasi pekerjaan') || lower.includes('work confirmation')) return t('notification.title.work_confirmation', text);
  if (lower.includes('butuh konfirmasi') || lower.includes('confirmation required') || lower.includes('tech confirm')) return t('notification.title.tech_confirm_needed', text);
  if (lower.includes('peringatan sla') || lower.includes('sla warning')) return t('notification.title.sla_warning', text);
  if (lower.includes('ph air tidak layak') || lower.includes('water ph unfit')) return t('notification.title.water_ph_unfit', text);
  if (lower.includes('hub offline') || lower.includes('hub terputus')) return t('notification.title.hub_offline', text);
  if (lower.includes('baterai lemah') || lower.includes('low battery') || lower.includes('hub battery low')) return t('notification.title.hub_battery_low', text);
  if (lower.includes('kontrol manual') || lower.includes('manual control') || lower.includes('[manual]')) return t('notification.title.manual_control', text);
  if (lower.includes('status perangkat') || lower.includes('device status') || lower.includes('hardware status') || lower.includes('[hardware baru]') || lower.includes('perangkat menyala') || lower.includes('perangkat mati')) return t('notification.title.hardware_status', text);
  if (lower.includes('otomasi sistem') || lower.includes('system automation') || lower.includes('sistem otomatis') || lower.includes('otomasi aktif') || lower.includes('otomasi selesai')) return t('notification.title.system_auto', text);
  // TEGURAN PING #1 / #2 / #3 — title from pingComplaint controller
  if (lower.includes('teguran ping') || lower.includes('ping warning') || lower.match(/ping #\d/)) return t('notification.title.ping_warning', text);
  // Ticket Dialihkan (re-assigned)
  if (lower.includes('tiket dialihkan') || lower.includes('ticket reassigned') || lower.includes('dialihkan')) return t('notification.title.ticket_reassigned', text);

  // Fallback ke kategori
  return getLocalizedCategory(category || text, t);
}

// ─── CATEGORY MATCHERS ─────────────────────────────────────────────────────────

/**
 * Melokalisasi label kategori notifikasi.
 * @param {string} text  - Teks kategori dari backend
 * @param {function} t  - Fungsi t() dari react-i18next
 * @returns {string}
 */
export function getLocalizedCategory(text, t) {
  if (!text) return t('notification.ui.title', 'Notifikasi');
  const lower = text.toLowerCase();

  if (lower.includes('bahaya') || lower === 'danger') return t('notification.category.danger', 'Bahaya');
  if (lower.includes('waspada') || lower === 'warning') return t('notification.category.warning', 'Waspada');
  if (lower.includes('keamanan') || lower === 'security') return t('notification.category.security', 'Keamanan');
  if (lower.includes('sistem') || lower.includes('hub') || lower.includes('kontrol') || lower === 'system') return t('notification.category.system', 'Sistem');
  if (lower.includes('pengaduan') || lower.includes('tiket') || lower.includes('tugas') || lower.includes('perbaikan') || lower === 'complaint') {
    return t('notification.category.complaint', 'Pengaduan');
  }
  if (lower.includes('kenyamanan') || lower === 'comfort') return t('notification.category.comfort', 'Kenyamanan');
  if (lower.includes('energi') || lower.includes('anggaran') || lower.includes('tarif') || lower === 'energy') {
    return t('notification.category.energy', 'Energi');
  }
  if (lower.includes('air') || lower.includes('tandon') || lower.includes('ph') || lower.includes('kualitas air') || lower === 'water') {
    return t('notification.category.water', 'Air Sanitasi');
  }
  return text;
}

// ─── MESSAGE MATCHERS (Regex-based) ────────────────────────────────────────────

/**
 * Melokalisasi pesan notifikasi menggunakan regex untuk mengekstrak parameter dinamis.
 * Fallback ke teks asli jika tidak ada pola yang cocok.
 * @param {string} text  - Pesan asli dari backend
 * @param {object} metadata - Metadata notifikasi (opsional)
 * @param {function} t   - Fungsi t() dari react-i18next
 * @returns {string}
 */
export function getLocalizedMessage(text, metadata = {}, t) {
  if (!text) return '';
  const lower = text.toLowerCase();

  // ── Complaint / Ticket Flow ──────────────────────────────────────────────────
  if (lower.includes('terkirim dan menunggu') || lower.includes('awaiting action from the technical team')) {
    return t('notification.msg.complaint_sent');
  }
  if (lower.includes('diajukan ke sistem') || lower.includes('tiket pengaduan baru telah diajukan') || lower.includes('new complaint ticket has been submitted')) {
    return t('notification.msg.new_ticket');
  }
  if (lower.includes('dalam perjalanan') || lower.includes('mulai memproses') || lower.includes('starting to process your complaint')) {
    return t('notification.msg.tech_processing');
  }
  if (lower.includes('selesai dilakukan') || lower.includes('berikan rating layanan') || lower.includes('repair has been completed')) {
    return t('notification.msg.repair_finished');
  }
  if (lower.includes('pekerjaan perbaikan telah selesai') || lower.includes('repair job has been completed')) {
    return t('notification.msg.job_finished');
  }
  if (lower.includes('tidak dapat diproses saat ini') || lower.includes('cannot be processed at this time')) {
    return t('notification.msg.complaint_rejected');
  }
  if (lower.includes('tiket pengaduan telah dibatalkan') && !lower.includes('topic')) {
    return t('notification.msg.ticket_cancelled');
  }
  if (lower.includes('meminta akses log perangkat') || lower.includes('requesting device log access')) {
    return t('notification.msg.log_request');
  }
  if (lower.includes('akses log perangkat telah diberikan') || lower.includes('log access has been granted')) {
    return t('notification.msg.log_granted');
  }
  if (lower.includes('akses log perangkat ditolak oleh pelanggan') || lower.includes('log access was denied by the customer')) {
    return t('notification.msg.log_denied');
  }
  if (lower.includes('tugas perbaikan baru telah ditambahkan ke jadwal') || lower.includes('new repair task has been added')) {
    return t('notification.msg.new_task');
  }
  if (lower.includes('teknisi baru telah ditugaskan') || lower.includes('new technician has been assigned')) {
    return t('notification.msg.tech_assigned');
  }
  if (lower.includes('penyesuaian pada pengaturan') || lower.includes('anggaran energi bulanan') || lower.includes('adjustments have been made')) {
    return t('notification.msg.budget_updated');
  }
  if (lower.includes('dihidupkan/dimatikan') || lower.includes('melalui dasbor') || lower.includes('via dashboard control')) {
    return t('notification.msg.device_control');
  }
  if (lower.includes('kadar air sanitasi') || lower.includes('sanitation water quality')) {
    return t('notification.msg.water_alert');
  }
  if (lower.includes('tegangan atau daya listrik') || lower.includes('voltage or power consumption')) {
    return t('notification.msg.power_alert');
  }

  // ── IoT Sensor: Security ─────────────────────────────────────────────────────
  const motionMatch = text.match(/sensor mendeteksi pergerakan mencurigakan pada pukul ([\d:.APM\s]+)/i);
  if (motionMatch) {
    return t('notification.msg.security_motion_detected', { time: (metadata.time || motionMatch[1] || '').trim() });
  }

  const doorMatch = text.match(/pintu di (.+?) terbuka melebihi batas waktu aman/i);
  if (doorMatch) {
    return t('notification.msg.door_open_warning', { location: metadata.location || doorMatch[1] || '' });
  }

  // ── IoT Sensor: Water ────────────────────────────────────────────────────────
  const phUnfitMatch = text.match(/pH Air terdeteksi tidak layak \(([\d.]+)\)/i);
  if (phUnfitMatch) {
    return t('notification.msg.water_ph_unfit', { ph: metadata.ph || phUnfitMatch[1] || '' });
  }

  const phCriticalMatch = text.match(/KRITIS: pH Air pada (.+?) terdeteksi di bawah standar \(([\d.]+)\)/i);
  if (phCriticalMatch) {
    return t('notification.msg.water_ph_critical', {
      deviceName: metadata.deviceName || phCriticalMatch[1] || '',
      ph: metadata.ph || phCriticalMatch[2] || ''
    });
  }

  const phLowMatch = text.match(/pH Air turun drastis ke level ([\d.]+)/i);
  if (phLowMatch) {
    return t('notification.msg.water_ph_low', { ph: metadata.ph || phLowMatch[1] || '' });
  }

  // ── IoT Sensor: Temperature ──────────────────────────────────────────────────
  const tempAcMatch = text.match(/Suhu ruangan melebihi ([\d.]+)°C, AC otomatis dinyalakan/i);
  if (tempAcMatch) {
    return t('notification.msg.temp_high_ac_on', { temp: metadata.temp || tempAcMatch[1] || '' });
  }

  const tempLocMatch = text.match(/Suhu ruangan di (.+?) mencapai ([\d.]+)°C/i);
  if (tempLocMatch) {
    return t('notification.msg.temp_high_location', {
      location: metadata.location || tempLocMatch[1] || '',
      temp: metadata.temp || tempLocMatch[2] || ''
    });
  }

  // ── Budget / Energy ──────────────────────────────────────────────────────────
  const budgetUsageMatch = text.match(/Penggunaan listrik bulan ini sudah mencapai ([\d.]+)%/i);
  if (budgetUsageMatch) {
    return t('notification.msg.budget_usage_high', { percent: metadata.percent || budgetUsageMatch[1] || '' });
  }

  const budgetNominalMatch = text.match(/Anggaran listrik bulanan Anda berhasil diatur menjadi Rp ([\d,.]+)/i);
  if (budgetNominalMatch) {
    return t('notification.msg.budget_updated_nominal', { amount: metadata.amount || budgetNominalMatch[1] || '' });
  }

  const budgetSuccessMatch = text.match(/Anggaran listrik bulanan Anda berhasil diperbarui menjadi Rp ([\d,.]+)/i);
  if (budgetSuccessMatch) {
    return t('notification.msg.budget_updated_success', { budget: metadata.budget || budgetSuccessMatch[1] || '' });
  }

  const budgetLimitChangedMatch = text.match(/Batas peringatan sisa anggaran Anda telah diubah menjadi Rp ([\d,.]+)/i);
  if (budgetLimitChangedMatch) {
    return t('notification.msg.budget_limit_changed', { limit: metadata.limit || budgetLimitChangedMatch[1] || '' });
  }

  const budgetLimitWarningMatch = text.match(/Batas peringatan yang Anda setel \(Rp ([\d,.]+)\) lebih besar dari total anggaran Anda \(Rp ([\d,.]+)\)/i);
  if (budgetLimitWarningMatch) {
    return t('notification.msg.budget_limit_warning', {
      limit: metadata.limit || budgetLimitWarningMatch[1] || '',
      budget: metadata.budget || budgetLimitWarningMatch[2] || ''
    });
  }

  // ── Schedule / Automation ────────────────────────────────────────────────────
  const scheduleAutoMatch = text.match(/Jadwal otomatisasi \((.+?)\) berhasil dieksekusi/i);
  if (scheduleAutoMatch) {
    return t('notification.msg.schedule_automation_executed', { name: metadata.name || scheduleAutoMatch[1] || '' });
  }

  const scheduleDeviceMatch = text.match(/Perangkat (.+?) telah di-(.+?) secara otomatis berdasarkan jadwal/i);
  if (scheduleDeviceMatch) {
    return t('notification.msg.schedule_device_action', {
      deviceName: metadata.deviceName || scheduleDeviceMatch[1] || '',
      action: metadata.action || scheduleDeviceMatch[2] || ''
    });
  }

  const sysAutoMatch = text.match(/Sistem otomatis (.+?) (.+?) karena kondisi (.+?) (.+?)\./i);
  if (sysAutoMatch) {
    return t('notification.msg.system_auto_action', {
      action: metadata.action || sysAutoMatch[1] || '',
      deviceName: metadata.deviceName || sysAutoMatch[2] || '',
      aspect: metadata.aspect || sysAutoMatch[3] || '',
      condition: metadata.condition || sysAutoMatch[4] || ''
    });
  }

  // ── Hub / System ─────────────────────────────────────────────────────────────
  const hubOfflineMatch = text.match(/(.+?) terdeteksi offline\./i);
  if (hubOfflineMatch && lower.includes('terdeteksi offline')) {
    return t('notification.msg.hub_offline', { hubName: metadata.hubName || hubOfflineMatch[1] || 'Hub' });
  }

  if (lower.includes('hub') && lower.includes('kehilangan koneksi')) {
    return t('notification.msg.hub_offline', { hubName: metadata.hubName || 'Hub' });
  }

  const hubBatteryMatch = text.match(/Baterai (.+?) tersisa ([\d.]+)%/i);
  if (hubBatteryMatch) {
    return t('notification.msg.hub_battery_low', {
      hubName: metadata.hubName || hubBatteryMatch[1] || 'Hub',
      percent: metadata.percent || hubBatteryMatch[2] || ''
    });
  }

  // ── Manual / Hardware Log ────────────────────────────────────────────────────
  const manualMatch = text.match(/\[Manual\] Anda telah (.+?) (.+?) di (.+?)\./i);
  if (manualMatch) {
    return t('notification.msg.manual_device_action', {
      action: metadata.action || manualMatch[1] || '',
      deviceName: metadata.deviceName || manualMatch[2] || '',
      location: metadata.location || manualMatch[3] || ''
    });
  }

  const hardwareStatusMatch = text.match(/\[Hardware Baru\] Perangkat (.+?) telah berubah status menjadi (.+?)\./i);
  if (hardwareStatusMatch) {
    return t('notification.msg.hardware_status_changed', {
      deviceName: metadata.deviceName || hardwareStatusMatch[1] || '',
      status: metadata.status || hardwareStatusMatch[2] || ''
    });
  }

  const logDeviceMatch = text.match(/\[Log\] Perangkat (.+?) di (.+?) telah berubah status menjadi (.+?)\./i);
  if (logDeviceMatch) {
    return t('notification.msg.log_device_status', {
      deviceName: metadata.deviceName || logDeviceMatch[1] || '',
      location: metadata.location || logDeviceMatch[2] || '',
      status: metadata.status || logDeviceMatch[3] || ''
    });
  }

  // ── Technician & Admin Flows ─────────────────────────────────────────────────
  const slaAlmostMatch = text.match(/Tiket (.+?) hampir melewati batas SLA/i);
  if (slaAlmostMatch) {
    return t('notification.msg.sla_almost_overdue', { ticketId: metadata.ticketId || slaAlmostMatch[1] || '' });
  }

  const newTicketTechMatch = text.match(/Anda ditugaskan untuk menangani pengaduan: "(.+?)"/i);
  if (newTicketTechMatch) {
    return t('notification.msg.new_ticket_assigned_tech', { topic: metadata.topic || newTicketTechMatch[1] || '' });
  }

  const ticketFinishedTechMatch = text.match(/Tiket "(.+?)" telah selesai\. Anda mendapat rating ([\d.]+)/i);
  if (ticketFinishedTechMatch) {
    return t('notification.msg.ticket_finished_tech', {
      topic: metadata.topic || ticketFinishedTechMatch[1] || '',
      stars: metadata.stars || ticketFinishedTechMatch[2] || ''
    });
  }

  const ticketCancelledTechMatch = text.match(/Tiket "(.+?)" yang Anda tangani telah dibatalkan/i);
  if (ticketCancelledTechMatch) {
    return t('notification.msg.ticket_cancelled_tech', { topic: metadata.topic || ticketCancelledTechMatch[1] || '' });
  }

  const adminPingMatch = text.match(/Admin mengirimkan PING! Segera selesaikan tiket (.+?)[.!]? Status urgensi: (.+?)([.!]\s*$|$)/i);
  if (adminPingMatch) {
    const urgencyRaw = (adminPingMatch[2] || '').replace(/[.!]$/, '').trim();
    return t('notification.msg.ping_tech', {
      topic: metadata.topic || adminPingMatch[1]?.trim() || '',
      urgency: metadata.urgency || urgencyRaw
    });
  }

  if (lower.includes('batas waktu respon terlampaui') || lower.includes('response time limit exceeded') || lower.includes('status otomatis berubah menjadi overdue respons')) {
    return t('notification.msg.sla_overdue_respons_auto');
  }

  if (lower.includes('batas waktu perbaikan terlampaui') || lower.includes('status otomatis berubah menjadi overdue perbaikan')) {
    return t('notification.msg.overdue_repair');
  }

  const overdueResponseMatch = text.match(/Tiket (.+?) telah melewati batas waktu respon 30 menit/i);
  if (overdueResponseMatch) {
    return t('notification.msg.overdue_response', { topic: metadata.topic || overdueResponseMatch[1] || '' });
  }

  // SLA Approaching (mock data: "mendekati batas waktu SLA")
  const slaApproachingMatch = text.match(/(.+?) mendekati batas waktu SLA/i);
  if (slaApproachingMatch) {
    return t('notification.msg.sla_approaching', { topic: metadata.topic || slaApproachingMatch[1] || '' });
  }

  const logAccessApprovedMatch = text.match(/Permintaan akses Data Log untuk (.+?) telah disetujui SuperAdmin/i);
  if (logAccessApprovedMatch) {
    return t('notification.msg.log_access_approved', { bieonId: metadata.bieonId || logAccessApprovedMatch[1] || '' });
  }

  const logAccessApprovedCompMatch = text.match(/SuperAdmin menyetujui akses data log untuk tiket (.+?)\./i);
  if (logAccessApprovedCompMatch) {
    return t('notification.msg.log_access_approved_comp', { topic: metadata.topic || logAccessApprovedCompMatch[1] || '' });
  }

  const logAccessDeniedCompMatch = text.match(/Maaf, akses data log untuk tiket (.+?) ditolak oleh SuperAdmin/i);
  if (logAccessDeniedCompMatch) {
    return t('notification.msg.log_access_denied_comp', { topic: metadata.topic || logAccessDeniedCompMatch[1] || '' });
  }

  const maintenanceMatch = text.match(/Jadwal Pemeliharaan Rutin untuk (.+?) dijadwalkan hari ini/i);
  if (maintenanceMatch) {
    return t('notification.msg.maintenance_scheduled', { area: metadata.area || maintenanceMatch[1] || '' });
  }

  const criticalHubsMatch = text.match(/KRITIS: ([\d]+) Hub IoT di (.+?) offline secara bersamaan/i);
  if (criticalHubsMatch) {
    return t('notification.msg.critical_hubs_offline', {
      count: metadata.count || criticalHubsMatch[1] || '',
      location: metadata.location || criticalHubsMatch[2] || ''
    });
  }

  const hubConnLostMatch = text.match(/KONEKSI TERPUTUS: Hub BIEON milik pelanggan (.+?) tidak dapat dihubungi/i);
  if (hubConnLostMatch) {
    return t('notification.msg.hub_connection_lost', { bieonId: metadata.bieonId || hubConnLostMatch[1] || '' });
  }

  const perfReportMatch = text.match(/Laporan Performa Teknisi Bulan (.+?) sudah siap/i);
  if (perfReportMatch) {
    return t('notification.msg.performance_report_ready', { month: metadata.month || perfReportMatch[1] || '' });
  }

  const slaViolationMatch = text.match(/SLA Pelanggaran: Teknisi (.+?) gagal merespons tiket (.+?) dalam 30 menit/i);
  if (slaViolationMatch) {
    return t('notification.msg.sla_violation_tech', {
      technician: metadata.technician || slaViolationMatch[1] || '',
      ticketId: metadata.ticketId || slaViolationMatch[2] || ''
    });
  }

  const adminNewComplaintMatch = text.match(/Ada pengaduan baru dari (.+?)\. Hub: (.+?)\. Topik: (.+)/i);
  if (adminNewComplaintMatch) {
    return t('notification.msg.admin_new_complaint_full', {
      senderName: metadata.senderName || adminNewComplaintMatch[1] || '',
      bieonId: metadata.bieonId || adminNewComplaintMatch[2] || '',
      topic: metadata.topic || adminNewComplaintMatch[3] || ''
    });
  }

  const techStartedMatch = text.match(/Teknisi (.+?) telah mulai mengerjakan tiket "(.+?)"/i);
  if (techStartedMatch) {
    return t('notification.msg.tech_started_working', {
      technician: metadata.technician || metadata.technicianName || techStartedMatch[1] || '',
      topic: metadata.topic || techStartedMatch[2] || ''
    });
  }

  const ticketFeedbackMatch = text.match(/Tiket "(.+?)" selesai\. Rating: ([\d.]+)★\. Ulasan: (.+)/i);
  if (ticketFeedbackMatch) {
    return t('notification.msg.ticket_completed_feedback', {
      topic: metadata.topic || ticketFeedbackMatch[1] || '',
      stars: metadata.stars || ticketFeedbackMatch[2] || '',
      review: metadata.review || ticketFeedbackMatch[3] || ''
    });
  }

  const ticketCancelledByCustomerMatch = text.match(/Tiket "(.+?)" telah dibatalkan oleh pelanggan/i);
  if (ticketCancelledByCustomerMatch) {
    return t('notification.msg.ticket_cancelled_by_customer', { topic: metadata.topic || ticketCancelledByCustomerMatch[1] || '' });
  }

  const techRequestedLogMatch = text.match(/Teknisi meminta akses log untuk tiket (.+?)\. Alasan: (.+)/i);
  if (techRequestedLogMatch) {
    return t('notification.msg.tech_requested_log', {
      topic: metadata.topic || techRequestedLogMatch[1] || '',
      reason: metadata.reason || techRequestedLogMatch[2] || ''
    });
  }

  const overdueRespAdminMatch = text.match(/Tiket dari (.+?) Overdue Respons!/i);
  if (overdueRespAdminMatch) {
    return t('notification.msg.overdue_respons_admin', { bieonId: metadata.bieonId || overdueRespAdminMatch[1] || '' });
  }

  const overdueRepairAdminMatch = text.match(/Tiket dari (.+?) Overdue Perbaikan!/i);
  if (overdueRepairAdminMatch) {
    return t('notification.msg.overdue_repair_admin', { bieonId: metadata.bieonId || overdueRepairAdminMatch[1] || '' });
  }

  const complaintCreatedSuccessMatch = text.match(/Tiket pengaduan #([\w-]+) telah berhasil dibuat\. Teknisi akan segera ditugaskan\./i) ||
                                       text.match(/Complaint ticket #([\w-]+) has been successfully created\. A technician will be assigned shortly\./i);
  if (complaintCreatedSuccessMatch) {
    return t('notification.msg.complaint_created_success', { ticketId: metadata.ticketId || complaintCreatedSuccessMatch[1] || '' });
  }

  const homeownerCreatedMatch = text.match(/Tiket pengaduan "(.+?)" Anda berhasil dibuat/i);
  if (homeownerCreatedMatch) {
    return t('notification.msg.homeowner_complaint_created', { topic: metadata.topic || homeownerCreatedMatch[1] || '' });
  }

  const techCompletedRepairMatch = text.match(/Teknisi telah menyelesaikan perbaikan tiket "(.+?)"/i);
  if (techCompletedRepairMatch) {
    return t('notification.msg.tech_completed_repair', { topic: metadata.topic || techCompletedRepairMatch[1] || '' });
  }

  // ── Konfirmasi Pekerjaan Teknisi (dari mock data / backend menunggu konfirmasi) ─────
  const workConfirmationMatch = text.match(/Konfirmasi pekerjaan teknisi untuk tiket #([\w-]+) diperlukan sebelum ditutup/i);
  if (workConfirmationMatch) {
    return t('notification.msg.work_confirmation_required', { ticketId: metadata.ticketId || workConfirmationMatch[1] || '' });
  }

  // ── Ticket Dialihkan (Re-assign dari assignTechnician controller) ─────────────
  const ticketReassignedMatch = text.match(/Tiket dialihkan dari (.+?) ke (.+?) karena melewati batas waktu/i);
  if (ticketReassignedMatch) {
    return t('notification.msg.ticket_reassigned', {
      oldTech: metadata.oldTech || ticketReassignedMatch[1] || '',
      newTech: metadata.newTech || ticketReassignedMatch[2] || ''
    });
  }

  // ── SLA Overdue Perbaikan Teknisi (56 jam dari controller) ───────────────────
  const slaOverdueRepairTechMatch = text.match(/Peringatan: Perbaikan tiket (.+?) telah melewati batas 56 jam/i);
  if (slaOverdueRepairTechMatch) {
    return t('notification.msg.sla_overdue_repair_tech', { topic: metadata.topic || slaOverdueRepairTechMatch[1] || '' });
  }

  // ── SLA Overdue Perbaikan Admin (dari controller) ────────────────────────────
  const slaOverdueRepairAdminMatch = text.match(/Tiket (.+?) telah melewati batas waktu perbaikan/i);
  if (slaOverdueRepairAdminMatch) {
    return t('notification.msg.sla_overdue_repair_admin', { bieonId: metadata.bieonId || slaOverdueRepairAdminMatch[1] || '' });
  }

  const homeownerRejectedMatch = text.match(/Maaf, pengaduan "(.+?)" Anda ditolak\. Alasan: (.+)/i);
  if (homeownerRejectedMatch) {
    return t('notification.msg.homeowner_complaint_rejected', {
      topic: metadata.topic || homeownerRejectedMatch[1] || '',
      reason: metadata.reason || homeownerRejectedMatch[2] || ''
    });
  }

  const homeownerAssignedMatch = text.match(/Tiket pengaduan "(.+?)" Anda telah ditugaskan ke teknisi (.+?)\./i);
  if (homeownerAssignedMatch) {
    return t('notification.msg.homeowner_ticket_assigned', {
      topic: metadata.topic || homeownerAssignedMatch[1] || '',
      technician: metadata.technician || metadata.technicianName || homeownerAssignedMatch[2] || ''
    });
  }

  const techProgressMatch = text.match(/Teknisi memperbarui progres: "(.+?)"/i);
  if (techProgressMatch) {
    return t('notification.msg.tech_updated_progress', { progress: metadata.progress || techProgressMatch[1] || '' });
  }

  if (lower.includes('akses tidak sah') || lower.includes('unauthorized access')) {
    return t('notification.msg.unauthorized_access');
  }

  if (lower.includes('batas waktu sla') || lower.includes('sla deadline')) {
    return t('notification.msg.sla_overdue');
  }

  // ── Fallback: kembalikan teks asli ──────────────────────────────────────────
  return text;
}

export function translateNotificationMessage(text, metadata = {}, t, messageKey = null) {
  if (messageKey) {
    return t(messageKey, metadata);
  }
  return getLocalizedMessage(text, metadata, t);
}

export function translateNotificationTitle(text, category, t) {
  return getLocalizedTitle(text, category, t);
}
