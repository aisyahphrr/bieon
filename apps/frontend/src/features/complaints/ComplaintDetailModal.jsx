import React from 'react';
import {
    ArrowLeft,
    User,
    Cpu,
    Clock,
    Star,
    CheckCircle2,
    Bell,
    FileText,
    Mail,
    Phone,
    MapPin,
    AlertCircle,
    X
} from 'lucide-react';
import { formatStatusDisplay } from '../../utils/complaintHelpers';
import { useSLA } from '../../hooks/useSLA';

/**
 * Standard BIEON Component for Complaint Details
 * Shared between Homeowner, Technician, and Superadmin roles.
 */
export function ComplaintDetailModal({
    isOpen,
    onClose,
    ticket,
    renderActions,
    title = "Detail Pengaduan"
}) {
    if (!isOpen || !ticket) return null;

    // Helper: Badge Status Standard
    const StatusBadge = ({ ticket }) => {
        const baseClasses = "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all";
        const { level, isOverdue, type } = useSLA(ticket.createdAt, ticket.assignedAt, ticket.processStartedAt, ticket.status);
        const displayStatus = formatStatusDisplay(ticket.status);

        const performanceIndicator = ticket.status.toLowerCase() === 'selesai' ? (
            <div className="flex items-center gap-1.5 ml-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                    ticket.points >= 90 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                    ticket.points >= 70 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 
                    'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                }`} title={`Performance: ${ticket.points || 0} pts`} />
            </div>
        ) : null;

        const slaTimer = (ticket.status.toLowerCase() === 'diproses' || ticket.status.toLowerCase() === 'menunggu respons' || isOverdue) ? (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ml-2 ${
                level === 'red' ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' :
                level === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                'bg-teal-50 text-teal-600 border-teal-100'
            }`}>
                SLA: {type} {isOverdue ? 'OVERDUE' : ''}
            </span>
        ) : null;

        const colors = {
            'unassigned': 'bg-gray-50 text-gray-400 border-gray-100',
            'menunggu respons': 'bg-blue-50 text-blue-600 border-blue-100',
            'diproses': 'bg-teal-50 text-teal-600 border-teal-100',
            'overdue respons': 'bg-red-50 text-red-600 border-red-100',
            'overdue perbaikan': 'bg-red-50 text-red-600 border-red-100',
            'menunggu konfirmasi': 'bg-orange-50 text-orange-600 border-orange-100',
            'selesai': 'bg-[#E1F2EB] text-[#1E4D40] border-[#BEE3D1]',
            'ditolak': 'bg-red-50 text-red-600 border-red-100'
        };

        const cleanStatus = ticket.status.toLowerCase();
        const badgeClass = colors[cleanStatus] || 'bg-gray-50 text-gray-500 border-gray-100';

        return (
            <div className="flex items-center">
                <span className={`${baseClasses} ${badgeClass}`}>
                    {displayStatus}
                </span>
                {slaTimer}
                {performanceIndicator}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
            <div className="w-full max-w-[1200px] h-full max-h-[95vh] flex flex-col relative animate-in fade-in zoom-in duration-300">

                {/* HEADER AREA */}
                <div className="flex items-center gap-4 mb-8 shrink-0 mt-4 px-2 lg:px-4 hidden md:flex">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-bold border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                </div>

                {/* MOBILE HEADER */}
                <div className="flex justify-between items-center mb-6 shrink-0 md:hidden px-2">
                    <button onClick={onClose} className="flex items-center gap-2 text-white font-bold">
                        <ArrowLeft className="w-5 h-5" /> Kembali
                    </button>
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                </div>

                <style>{`
                    .modal-custom-scrollbar::-webkit-scrollbar { width: 8px; }
                    .modal-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .modal-custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.4); border-radius: 9999px; }
                    .modal-custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.7); }
                `}</style>

                {/* MAIN CONTENT AREA (SCROLLABLE) */}
                <div className="flex-1 overflow-y-auto pb-8 modal-custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-1 lg:px-4">

                        {/* MOBILE ONLY: ROLE ACTIONS SLOT (At the very top) */}
                        {renderActions && (
                            <div className="lg:hidden bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    Aksi Tersedia
                                </h3>
                                <div className="space-y-3">
                                    {renderActions}
                                </div>
                            </div>
                        )}

                        {/* LEFT COLUMN (2/3) - Main Ticket Details */}
                        <div className="lg:col-span-2 space-y-6">

                            <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-100 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 pb-4 border-b border-gray-100">
                                    <div className="text-start">
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{ticket.topic}</h3>
                                        <p className="text-[11px] text-gray-500 font-medium">ID Tiket: {ticket.id}</p>
                                    </div>
                                    <div className="shrink-0">
                                        <StatusBadge ticket={ticket} />
                                    </div>
                                </div>

                                <div className="space-y-6 text-start">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-[10px] mb-2 uppercase tracking-wider">
                                            Deskripsi Pengaduan
                                        </h4>
                                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {ticket.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-50">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Kategori</p>
                                            <p className="font-semibold text-sm text-gray-800">{ticket.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Ruangan & Perangkat</p>
                                            <p className="font-semibold text-sm text-gray-800">{ticket.device}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Tanggal Masuk</p>
                                            <p className="font-semibold text-sm text-gray-800">{ticket.date}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{ticket.status === 'Selesai' ? 'Penyelesaian' : 'Terakhir Update'}</p>
                                            <p className={`font-semibold text-sm ${ticket.status === 'Selesai' ? 'text-teal-600' : 'text-gray-800'}`}>
                                                {ticket.finishedDate || (ticket.timeline && ticket.timeline[0]?.time) || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-gray-800 text-[11px] mb-4 uppercase tracking-wider">
                                            Upload Files
                                        </h4>
                                        {ticket.files && ticket.files.length > 0 ? (
                                            <div className="flex flex-wrap gap-4">
                                                {ticket.files.map((file, idx) => (
                                                    <div key={idx} className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">Tidak ada lampiran file.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* BOX: RIWAYAT PROGRESS */}
                            <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-100 shadow-sm text-start">
                                <h3 className="font-bold text-base text-gray-900 mb-6 flex items-center gap-3">
                                    Riwayat Progres Pengaduan
                                </h3>
                                <div className="space-y-6 pl-1">
                                    {ticket.timeline && ticket.timeline.map((step, idx) => (
                                        <div key={idx} className="relative flex gap-5">
                                            {idx !== ticket.timeline.length - 1 && (
                                                <div className="absolute left-[7px] top-6 bottom-[-28px] w-[1px] bg-gray-200"></div>
                                            )}
                                            <div className="relative z-10 shrink-0 mt-1">
                                                <div className={`w-3.5 h-3.5 rounded-full ring-4 ring-white ${idx === 0 ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-400 mb-1">{step.time}</div>
                                                <div className="text-sm text-gray-800 font-medium leading-relaxed">{step.desc}</div>
                                                {step.status && (
                                                    <div className="text-[9px] text-teal-600 font-bold mt-1.5 bg-teal-50 inline-block px-1.5 py-0.5 rounded border border-teal-100 tracking-wide">
                                                        {step.status.replace('Status: ', '')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* BOX: HASIL PENILAIAN */}
                            {ticket.status === 'Selesai' && ticket.rating && (
                                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-start">
                                    {(() => {
                                        const stars = typeof ticket.rating === 'object' ? ticket.rating.stars : ticket.rating;
                                        const review = typeof ticket.rating === 'object' ? ticket.rating.review : "Memberikan rating tanpa ulasan tertulis.";

                                        return (
                                            <>
                                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                                                            <User className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-base font-bold text-gray-900 leading-tight">{ticket.technicianInfo?.name || ticket.client || ticket.clientInfo?.name || 'User'}</h3>
                                                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Rate: {stars}/5</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-0.5 pl-13 md:pl-0 mt-1 md:mt-0">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star key={s} className={`w-4 h-4 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100">
                                                    <h4 className="text-[10px] font-bold text-gray-800 mb-2 uppercase tracking-wider">Ulasan</h4>
                                                    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 border-dashed">
                                                        <p className="text-sm text-gray-600 italic leading-relaxed">
                                                            "{review}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN (1/3) - Sidebar Information */}
                        <div className="lg:col-span-1 space-y-6 text-start">

                            {/* BOX: INFORMASI CLIENT */}
                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-xs font-bold text-darkgrey-400 uppercase tracking-wider mb-6 pb-2 border-b border-gray-50 flex items-center justify-between">
                                    Informasi Pelanggan
                                    <User className="w-4 h-4 text-blue-500" />
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-blue-600 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Nama Pelanggan</p>
                                            <p className="text-sm font-semibold text-gray-900">{ticket.clientInfo?.name || ticket.client}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                                            <span className="text-sm font-medium text-gray-700">{ticket.clientInfo?.email || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                                            <span className="text-sm font-medium text-gray-700">{ticket.clientInfo?.phone || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Alamat</p>
                                            <p className="text-sm font-medium text-gray-700 leading-relaxed">{ticket.clientInfo?.address || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">ID BIEON</p>
                                            <p className="text-sm font-bold text-teal-700">{ticket.clientInfo?.idBieon || 'N/A'}</p>
                                        </div>
                                        <div className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-[10px] font-bold border border-teal-100">
                                            ACTIVE
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BOX: INFORMASI TEKNISI */}
                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-xs font-bold text-darkgrey-400 uppercase tracking-wider mb-6 pb-2 border-b border-gray-50 flex items-center justify-between">
                                    Informasi Teknisi
                                    <Cpu className="w-4 h-4 text-purple-600" />
                                </h3>
                                {ticket.technicianInfo ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-purple-600 shrink-0" />
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Nama Teknisi</p>
                                                <p className="text-sm font-semibold text-gray-900">{ticket.technicianInfo.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">No Phone</p>
                                                <p className="text-sm font-medium text-gray-700">{ticket.technicianInfo.phone}</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Target Waktu Selesai</p>
                                                <p className="text-sm font-medium text-gray-800">{ticket.technicianInfo.targetDate}</p>
                                            </div>
                                        </div>

                                        {/* SLA PERFORMANCE POINTS */}
                                        <div className="pt-4 border-t border-gray-100">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-3 flex items-center gap-2">
                                                <Star className="w-3 h-3 text-amber-500" /> SLA Poin Performa
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Respons</p>
                                                    <p className={`text-sm font-bold ${ticket.technicianInfo.responsePoints >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{ticket.technicianInfo.responsePoints} pts</p>
                                                </div>
                                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Perbaikan</p>
                                                    <p className={`text-sm font-bold ${ticket.technicianInfo.repairPoints >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{ticket.technicianInfo.repairPoints} pts</p>
                                                </div>
                                            </div>
                                        </div>

                                        {(ticket.status === 'Selesai' || ticket.duration) && (
                                            <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Durasi Pengerjaan</p>
                                                    <p className="text-sm font-bold text-teal-600">{ticket.duration || 'N/A'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic py-4 text-center">Belum ada teknisi ditugaskan.</p>
                                )}
                            </div>

                            {/* BOX: ROLE ACTIONS SLOT (DESKTOP) */}
                            {renderActions && (
                                <div className="hidden lg:block bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                        Aksi Tersedia
                                    </h3>
                                    <div className="space-y-3">
                                        {renderActions}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
