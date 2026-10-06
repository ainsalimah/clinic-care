"use client";

import { useCallback, useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { ArrowRight, CalendarDays, Clock3, Loader2, RefreshCw, Stethoscope } from "lucide-react";
import { getClinicDateKey } from "@/lib/clinic-time";

interface Schedule { id: string; dayOfWeek: number; startTime: string; endTime: string; quota: number }
interface AvailableSchedule { id: string; doctorId: string; doctorName: string; startTime: string; endTime: string; quota: number; remaining: number; hasPassed: boolean }
interface Doctor { id: string; fullName: string; specialization: string | null; schedules: Schedule[] }
interface Department { id: string; name: string; doctors: Doctor[] }
interface Appointment { id: string; appointmentDate: string; status: string; notes: string | null; department: { name: string }; doctor: { fullName: string }; schedule: { startTime: string; endTime: string } | null; queue: { queueNumber: string } | null; bill: { total: number; paidAt: string | null; completedAt: string | null } | null; record: { prescription: { stockHeldAt: string | null; stockResumedAt: string | null } | null } | null }
interface PatientData { fullName: string; medicalRecordNo: string; appointments: Appointment[] }

const appointmentStatus: Record<string, string> = { PENDING: "Menunggu konfirmasi", CONFIRMED: "Dikonfirmasi", CHECKED_IN: "Sudah check-in", IN_EXAMINATION: "Sedang diperiksa", COMPLETED: "Selesai", CANCELLED: "Dibatalkan", NO_SHOW: "Tidak hadir" };

export default function PatientPortalPage() {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [availableSchedules, setAvailableSchedules] = useState<AvailableSchedule[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [welcome, setWelcome] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [patientRes, catalogRes] = await Promise.all([fetch("/api/patient/appointments"), fetch("/api/public/catalog")]);
      const [patientData, catalogData] = await Promise.all([patientRes.json(), catalogRes.json()]);
      if (patientRes.ok) setPatient(patientData.patient);
      else setError(patientData.error || "Profil pasien belum dapat dimuat.");
      const items = catalogData.departments ?? [];
      setDepartments(items);
      setDepartmentId((current) => current || items[0]?.id || "");
    } catch {
      setError("Koneksi terputus saat memuat portal pasien.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setWelcome(new URLSearchParams(window.location.search).get("welcome") === "1");
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!departmentId || !appointmentDate) { setAvailableSchedules([]); return; }
    const controller = new AbortController();
    setAvailabilityLoading(true);
    fetch(`/api/patient/availability?departmentId=${encodeURIComponent(departmentId)}&date=${appointmentDate}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Jadwal dokter tidak dapat dimuat.");
        setAvailableSchedules(data.schedules ?? []);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Jadwal dokter tidak dapat dimuat.");
      })
      .finally(() => { if (!controller.signal.aborted) setAvailabilityLoading(false); });
    return () => controller.abort();
  }, [departmentId, appointmentDate, availabilityVersion]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/patient/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scheduleId, appointmentDate, notes }) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Pengajuan kunjungan belum berhasil.");
        if (res.status === 409) { setScheduleId(""); setAvailabilityVersion((value) => value + 1); }
        return;
      }
      setNotice("Pengajuan jadwal terkirim. Resepsionis akan memeriksa dan mengonfirmasinya.");
      setScheduleId("");
      setAppointmentDate("");
      setNotes("");
      await refresh();
    } catch {
      setError("Koneksi terputus. Coba kirim pengajuan lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout breadcrumbTitle="Portal Pasien" activeNav="/patient">
      <div className="page patient-portal-page">
        <section className="patient-portal-hero">
          <div><span className="public-eyebrow">PORTAL PASIEN</span><h1>Halo, {patient?.fullName || "Pasien"}</h1><p>Ajukan jadwal kunjungan dan pantau konfirmasi dari resepsionis.</p></div>
          <div className="patient-rm-card"><span>Nomor rekam medis</span><b>{patient?.medicalRecordNo || "Memuat…"}</b></div>
        </section>

        {welcome && <div className="portal-notice"><span>Akun berhasil dibuat.</span> Data pasien sudah tercatat. Silakan ajukan jadwal kunjungan Anda.</div>}
        {error && <div className="patient-form-error" role="alert">{error}</div>}
        {notice && <div className="portal-notice" role="status"><span>{notice}</span></div>}

        <div className="patient-portal-grid">
          <section className="panel patient-booking-panel">
            <div className="panel-head"><div><p className="eyebrow">KUNJUNGAN BARU</p><h2>Ajukan jadwal dokter</h2></div><CalendarDays size={21} color="var(--teal)" /></div>
            <p className="patient-panel-intro">Pilih poli, tanggal, dan jadwal praktik. Pengajuan Anda akan ditinjau resepsionis sebelum dikonfirmasi.</p>
            <form onSubmit={submit} className="patient-booking-form">
              <label>Poli<select required value={departmentId} onChange={(event) => { setDepartmentId(event.target.value); setScheduleId(""); }}><option value="">Pilih poli</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>
              <label>Tanggal kunjungan<input type="date" required min={getClinicDateKey()} value={appointmentDate} onChange={(event) => { setAppointmentDate(event.target.value); setScheduleId(""); }} /></label>
              <label>Dokter dan jam praktik<select required value={scheduleId} onChange={(event) => setScheduleId(event.target.value)} disabled={!appointmentDate || availabilityLoading}><option value="">{availabilityLoading ? "Memeriksa ketersediaan..." : appointmentDate ? "Pilih dokter dan jadwal" : "Pilih tanggal terlebih dahulu"}</option>{availableSchedules.map((schedule) => <option key={schedule.id} value={schedule.id} disabled={schedule.remaining === 0 || schedule.hasPassed}>{schedule.doctorName} · {schedule.startTime}–{schedule.endTime} · {schedule.hasPassed ? "Sudah lewat" : schedule.remaining === 0 ? "Penuh" : `${schedule.remaining} slot tersisa`}</option>)}</select></label>
              {appointmentDate && !availabilityLoading && availableSchedules.length === 0 && <small className="booking-hint">Belum ada jadwal poli ini pada tanggal yang dipilih. Coba hari lain.</small>}
              {appointmentDate && !availabilityLoading && availableSchedules.length > 0 && availableSchedules.every((schedule) => schedule.remaining === 0 || schedule.hasPassed) && <small className="booking-hint">Semua jadwal sudah penuh atau lewat. Pilih tanggal lain.</small>}
              <label>Catatan untuk resepsionis <span className="optional-label">Opsional</span><textarea rows={3} maxLength={500} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Contoh: kunjungan kontrol" /></label>
              <div className="booking-info"><Clock3 size={16} /><span>Pengajuan belum menjadi antrean. Nomor antrean diterbitkan saat Anda check-in pada hari kunjungan.</span></div>
              <button type="submit" className="public-button-primary patient-submit" disabled={submitting || !scheduleId}>{submitting ? <><Loader2 size={16} className="spinner" /> Mengirim…</> : <>Kirim pengajuan <ArrowRight size={16} /></>}</button>
            </form>
          </section>

          <section className="panel patient-visits-panel">
            <div className="panel-head"><div><p className="eyebrow">RIWAYAT & STATUS</p><h2>Kunjungan saya</h2></div><button className="btn-refresh" type="button" disabled={loading} onClick={refresh} aria-label="Perbarui kunjungan"><RefreshCw size={15} className={loading ? "spinner" : ""} /></button></div>
            {loading ? <div className="table-loading"><Loader2 size={22} className="spinner" /><p>Memuat kunjungan…</p></div> : !patient?.appointments.length ? <div className="table-empty"><Stethoscope size={27} /><p>Belum ada kunjungan. Ajukan jadwal pertama Anda.</p></div> : <div className="patient-visit-list">
              {patient.appointments.map((appointment) => <article className="patient-visit-card" key={appointment.id}>
                <div className="visit-card-top"><span className={`appointment-status status-${appointment.status.toLowerCase()}`}>{appointment.record?.prescription?.stockHeldAt && !appointment.record.prescription.stockResumedAt ? "Obat ditunda — menunggu stok tersedia" : appointment.bill && !appointment.bill.completedAt ? (appointment.bill.paidAt ? "Menunggu penyerahan obat" : "Menunggu pembayaran di apotek") : appointmentStatus[appointment.status] || appointment.status}</span>{appointment.queue && <b className="queue-num">{appointment.queue.queueNumber}</b>}</div>
                {appointment.bill && <p>Total konsultasi dan obat: <b>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(appointment.bill.total)}</b> · {appointment.bill.paidAt ? "Lunas" : "Silakan menuju kasir apotek."}</p>}
                <h3>{appointment.department.name}</h3><p>{appointment.doctor.fullName}</p>
                <small><CalendarDays size={13} /> {new Date(appointment.appointmentDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}{appointment.schedule && ` · ${appointment.schedule.startTime}–${appointment.schedule.endTime}`}</small>
              </article>)}
            </div>}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
