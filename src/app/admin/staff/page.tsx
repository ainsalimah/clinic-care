"use client";
import { useCallback, useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { fetchJson } from "@/lib/http/client";

type Staff = { id: string; name: string; email: string; role: string; isActive: boolean; mustChangePassword: boolean; canChangeStatus: boolean; doctor: { department: { name: string }; schedules: { dayOfWeek: number; startTime: string; endTime: string }[] } | null };
const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const roles: Record<string, string> = { RECEPTIONIST: "Resepsionis", PHARMACIST: "Apoteker", DOCTOR: "Dokter", ADMIN: "Admin" };
export default function StaffPage() {
  const [users, setUsers] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [role, setRole] = useState("RECEPTIONIST");
  const [target, setTarget] = useState<Staff | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await fetchJson<{ users: Staff[]; count: number }>(`/api/admin/staff?q=${encodeURIComponent(q)}&page=${page}`); setUsers(data.users); setCount(data.count); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat staf."); }
    finally { setLoading(false); }
  }, [q, page]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { fetchJson<{ departments: { id: string; name: string }[] }>("/api/departments").then(data => setDepartments(data.departments)).catch(() => setError("Gagal memuat poli.")); }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>, create: boolean) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      await fetchJson("/api/admin/staff", { method: create ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(create ? { ...data, role, dayOfWeek: Number(data.dayOfWeek), quota: Number(data.quota) } : { ...data, id: target?.id, isActive: !target?.isActive }) });
      form.reset(); setTarget(null); setMessage(create ? "Akun dibuat. Sampaikan password awal secara pribadi; staf wajib menggantinya saat masuk." : "Status akun diperbarui dan sesi lama dicabut."); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal menyimpan."); }
    finally { setBusy(false); }
  }
  return <AppLayout breadcrumbTitle="Akun Staf" activeNav="/admin/staff"><div className="page">
    <h1 className="page-title">Akun staf</h1><p className="page-subtitle">Buat akun per petugas. Riwayat pelayanan tetap tersimpan ketika akun dinonaktifkan.</p>
    {error && <p role="alert" className="data-error">{error}</p>}{message && <p role="status" className="portal-notice">{message}</p>}
    <details className="panel billing-panel"><summary>Tambah staf baru</summary><form className="account-form" onSubmit={e => submit(e, true)}>
      <label>Nama lengkap<input name="name" required maxLength={100} autoComplete="off" /></label>
      <label>Email staf<input name="email" type="email" required maxLength={254} autoComplete="off" /></label>
      <label>Peran<select value={role} onChange={e => setRole(e.target.value)}>{Object.entries(roles).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
      <label>Password awal<input name="password" type="password" required minLength={12} maxLength={72} autoComplete="new-password" /><small>Minimal 12 karakter. Wajib diganti oleh staf setelah login.</small></label>
      {role === "DOCTOR" && <fieldset><legend>Poli dan jadwal praktik mingguan (WIB)</legend>
        <label>Poli<select name="departmentId" required><option value="">Pilih poli</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
        <label>Hari<select name="dayOfWeek" defaultValue="1">{days.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
        <label>Mulai<input name="startTime" type="time" required defaultValue="08:00" /></label><label>Selesai<input name="endTime" type="time" required defaultValue="12:00" /></label>
        <label>Kuota pasien<input name="quota" type="number" required min={1} max={200} defaultValue={20} /></label><small>Tarif awal Rp100.000; dapat diubah di menu Tarif Konsultasi.</small>
      </fieldset>}
      <label>Password admin untuk konfirmasi<input name="adminPassword" type="password" required autoComplete="current-password" /></label>
      <button className="btn-primary-action" disabled={busy}>{busy ? "Menyimpan…" : "Buat akun staf"}</button>
    </form></details>
    <form className="billing-filters" onSubmit={e => { e.preventDefault(); setPage(1); setQ(query); if (q === query) void load(); }}><label>Cari staf<input className="form-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nama atau email" maxLength={100} /></label><button className="btn-secondary">Cari</button></form>
    {target && <section className="panel billing-panel"><h2>{target.isActive ? "Nonaktifkan" : "Aktifkan"} {target.name}</h2><form className="account-form" onSubmit={e => submit(e, false)}><p>Akun sendiri tidak dapat dinonaktifkan. Dokter dengan kunjungan aktif harus menyelesaikan kunjungannya terlebih dahulu.</p><label>Password admin<input name="adminPassword" type="password" required autoComplete="current-password" /></label><div className="header-actions-group"><button className="btn-primary-action" disabled={busy}>Konfirmasi perubahan</button><button type="button" className="btn-secondary" disabled={busy} onClick={() => setTarget(null)}>Batal</button></div></form></section>}
    {loading ? <p role="status">Memuat staf…</p> : users.length ? users.map(user => <article key={user.id} className="panel staff-card"><div><h2>{user.name}</h2><p>{user.email} · {roles[user.role]}</p><p>{user.isActive ? "Aktif" : "Nonaktif"}{user.mustChangePassword ? " · Menunggu penggantian password awal" : ""}</p>{user.doctor && <p>{user.doctor.department.name} · {user.doctor.schedules.map(s => `${days[s.dayOfWeek]} ${s.startTime}–${s.endTime}`).join(", ")} WIB</p>}</div><button className="btn-secondary" disabled={busy || !user.canChangeStatus} onClick={() => setTarget(user)}>{user.canChangeStatus ? user.isActive ? "Nonaktifkan" : "Aktifkan" : "Akun saat ini"}</button></article>) : <p>Tidak ada staf yang sesuai.</p>}
    <div className="billing-pagination"><button className="btn-secondary" disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>Sebelumnya</button><span>Halaman {page} · {count} staf</span><button className="btn-secondary" disabled={page * 20 >= count || loading} onClick={() => setPage(page + 1)}>Berikutnya</button></div>
  </div></AppLayout>;
}
