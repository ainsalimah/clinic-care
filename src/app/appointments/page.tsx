"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { CalendarDays, CheckCircle2, Clock3, Loader2, Printer, RefreshCw, Stethoscope, X } from "lucide-react";

interface Appointment {
  id: string; appointmentDate: string; status: string; createdAt: string; notes: string | null;
  patient: { fullName: string; medicalRecordNo: string; nik: string | null; dateOfBirth: string; phone: string | null };
  department: { name: string }; doctor: { fullName: string };
  schedule: { startTime: string; endTime: string } | null;
  queue: { queueNumber: string } | null;
}
interface Ticket { queueNumber: string; patientName: string; medicalRecordNo: string; departmentName: string; doctorName: string; time: string; date: string }

export default function OnlineAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat pengajuan.");
      setAppointments(data.appointments ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pengajuan.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const pending = useMemo(() => appointments.filter((item) => item.status === "PENDING"), [appointments]);
  const confirmedToday = useMemo(() => appointments.filter((item) => item.status === "CONFIRMED" && !item.queue), [appointments]);

  const updateStatus = async (appointmentId: string, status: "CONFIRMED" | "CANCELLED") => {
    setError(""); setWorkingId(appointmentId);
    try {
      const res = await fetch("/api/appointments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appointmentId, status }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Pengajuan belum dapat diproses."); return; }
      await refresh();
    } catch { setError("Koneksi terputus saat memproses pengajuan."); }
    finally { setWorkingId(null); }
  };

  const checkIn = async (appointmentId: string) => {
    setError(""); setWorkingId(appointmentId);
    try {
      const res = await fetch("/api/queues/check-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appointmentId }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Check-in belum berhasil."); return; }
      setTicket(data.ticket);
      await refresh();
    } catch { setError("Koneksi terputus saat melakukan check-in."); }
    finally { setWorkingId(null); }
  };

  const visitDate = (date: string) => new Date(date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <AppLayout breadcrumbTitle="Kunjungan Online" activeNav="/appointments">
      <div className="page">
        <div className="section-header-flex">
          <div><h1 className="page-title">Pengajuan Kunjungan Online</h1><p className="page-subtitle">Periksa identitas dan ketersediaan sebelum mengonfirmasi. Antrean baru dibuat ketika pasien check-in.</p></div>
          <button type="button" className="btn-refresh" onClick={refresh}><RefreshCw size={15} className={loading ? "spinner" : ""} /> Perbarui</button>
        </div>
        {error && <div className="patient-form-error" role="alert">{error}</div>}

        <section className="panel online-request-panel">
          <div className="panel-head"><div><p className="eyebrow">TINDAKAN DIPERLUKAN</p><h2>Menunggu konfirmasi ({pending.length})</h2></div><span className="pending-count-badge"><Clock3 size={14} /> {pending.length} pengajuan</span></div>
          {loading ? <div className="table-loading"><Loader2 size={23} className="spinner" /><p>Memuat pengajuan…</p></div> : !pending.length ? <div className="table-empty"><CheckCircle2 size={29} /><p>Tidak ada pengajuan baru untuk diperiksa.</p></div> : <div className="online-appointment-list">
            {pending.map((item) => <article className="online-appointment-card" key={item.id}>
              <div className="online-appointment-main"><div className="appointment-date-tile"><CalendarDays size={19} /><b>{visitDate(item.appointmentDate)}</b><small>{item.schedule ? `${item.schedule.startTime}–${item.schedule.endTime}` : "Jadwal klinik"}</small></div><div className="online-patient-info"><span className="appointment-status status-pending">Menunggu konfirmasi</span><h3>{item.patient.fullName}</h3><p>No. RM {item.patient.medicalRecordNo} · NIK {item.patient.nik || "belum dicatat"}</p><p>Lahir {new Date(item.patient.dateOfBirth).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}{item.patient.phone ? ` · ${item.patient.phone}` : " · Tanpa nomor telepon"}</p><div className="appointment-doctor-line"><Stethoscope size={14} /> {item.department.name} · {item.doctor.fullName}</div>{item.notes && <small className="appointment-note">Catatan: {item.notes}</small>}</div></div>
              <div className="online-appointment-actions"><button type="button" className="btn-secondary" disabled={workingId === item.id} onClick={() => updateStatus(item.id, "CANCELLED")}><X size={15} /> Tolak</button><button type="button" className="btn-primary-action" disabled={workingId === item.id} onClick={() => updateStatus(item.id, "CONFIRMED")}>{workingId === item.id ? <Loader2 size={15} className="spinner" /> : <CheckCircle2 size={15} />} Verifikasi & konfirmasi</button></div>
            </article>)}
          </div>}
        </section>

        <section className="panel online-request-panel">
          <div className="panel-head"><div><p className="eyebrow">HARI INI</p><h2>Jadwal terkonfirmasi ({confirmedToday.length})</h2></div></div>
          {loading ? <div className="table-loading"><Loader2 size={23} className="spinner" /><p>Memuat jadwal…</p></div> : !confirmedToday.length ? <div className="table-empty"><CalendarDays size={29} /><p>Tidak ada jadwal online terkonfirmasi untuk check-in hari ini.</p></div> : <div className="online-appointment-list">
            {confirmedToday.map((item) => <article className="online-appointment-card confirmed" key={item.id}>
              <div className="online-appointment-main"><div className="appointment-date-tile"><CalendarDays size={19} /><b>{visitDate(item.appointmentDate)}</b><small>{item.schedule ? `${item.schedule.startTime}–${item.schedule.endTime}` : "Jadwal klinik"}</small></div><div className="online-patient-info"><span className="appointment-status status-confirmed">Dikonfirmasi</span><h3>{item.patient.fullName}</h3><p>{item.patient.medicalRecordNo}{item.patient.phone ? ` · ${item.patient.phone}` : ""}</p><div className="appointment-doctor-line"><Stethoscope size={14} /> {item.department.name} · {item.doctor.fullName}</div></div></div>
              <button type="button" className="btn-primary-action" disabled={workingId === item.id} onClick={() => checkIn(item.id)}>{workingId === item.id ? <Loader2 size={15} className="spinner" /> : <CheckCircle2 size={15} />} Check-in pasien</button>
            </article>)}
          </div>}
        </section>
      </div>

      {ticket && <div className="modal-backdrop"><section className="modal-card patient-ticket-modal"><div className="modal-header"><div><h3>Check-in berhasil</h3><p>Nomor antrean sudah diterbitkan.</p></div><button type="button" className="btn-close-modal" onClick={() => setTicket(null)} aria-label="Tutup"><X size={18} /></button></div><div className="ticket-card printable"><div className="ticket-head"><div className="ticket-brand"><Stethoscope size={18} /><span>KlinikCare · Tiket Antrean</span></div><span className="ticket-rm">{ticket.medicalRecordNo}</span></div><div className="ticket-queue-section"><small>NOMOR ANTREAN</small><div className="queue-big-number">{ticket.queueNumber}</div><p><b>{ticket.departmentName}</b> · {ticket.doctorName}</p><p>Pasien: <b>{ticket.patientName}</b></p><small>{ticket.date} · {ticket.time}</small></div></div><div className="modal-footer"><button type="button" className="btn-secondary" onClick={() => setTicket(null)}>Selesai</button><button type="button" className="btn-primary-action" onClick={() => window.print()}><Printer size={15} /> Cetak tiket</button></div></section></div>}
    </AppLayout>
  );
}
