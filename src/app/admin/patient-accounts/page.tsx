"use client";

import { useCallback, useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { fetchJson } from "@/lib/http/client";

type PatientAccount = {
  id: string;
  fullName: string;
  medicalRecordNo: string;
  isActive: boolean;
  mustChangePassword: boolean;
};

type RecoveryResult = { email: string; maskedEmail: string; temporaryPassword?: string };

export default function PatientAccountsPage() {
  const [patients, setPatients] = useState<PatientAccount[]>([]);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<PatientAccount | null>(null);
  const [result, setResult] = useState<RecoveryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchJson<{ patients: PatientAccount[]; count: number }>(`/api/admin/patient-accounts?q=${encodeURIComponent(q)}&page=${page}`);
      setPatients(data.patients); setCount(data.count);
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat akun pasien."); }
    finally { setLoading(false); }
  }, [q, page]);

  useEffect(() => { void load(); }, [load]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setResult(null);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const action = submitter?.value;
    try {
      const response = await fetchJson<RecoveryResult>("/api/admin/patient-accounts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, patientId: selected?.id, action }),
      });
      setResult(response);
      if (action === "reset") await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Pemulihan akun gagal."); }
    finally { setBusy(false); }
  }

  return <AppLayout breadcrumbTitle="Pemulihan Akun Pasien" activeNav="/admin/patient-accounts"><div className="page">
    <h1 className="page-title">Pemulihan akun pasien</h1>
    <p className="page-subtitle">Cari pasien, cocokkan tiga data identitas, lalu bantu menemukan email atau buat password sementara.</p>
    {error && <p role="alert" className="data-error">{error}</p>}
    <form className="billing-filters" onSubmit={event => { event.preventDefault(); setPage(1); setQ(query); if (q === query) void load(); }}>
      <label>Cari pasien<input className="form-input" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nama, No. RM, NIK, atau telepon" maxLength={100} /></label>
      <button className="btn-secondary">Cari</button>
    </form>
    {loading ? <p role="status">Memuat akun pasien…</p> : patients.length ? patients.map(patient => <article key={patient.id} className="panel staff-card">
      <div><h2>{patient.fullName}</h2><p>{patient.medicalRecordNo}</p><p>{patient.isActive ? "Aktif" : "Nonaktif"}{patient.mustChangePassword ? " · Menunggu penggantian password" : ""}</p></div>
      <button className="btn-secondary" disabled={!patient.isActive} onClick={() => { setSelected(patient); setResult(null); setError(""); }}>Pulihkan akun</button>
    </article>) : <p>Tidak ada akun pasien yang sesuai.</p>}
    <div className="billing-pagination"><button className="btn-secondary" disabled={page === 1 || loading} onClick={() => setPage(page - 1)}>Sebelumnya</button><span>Halaman {page} · {count} akun pasien</span><button className="btn-secondary" disabled={page * 20 >= count || loading} onClick={() => setPage(page + 1)}>Berikutnya</button></div>

    {selected && <section className="panel billing-panel recovery-admin-panel">
      <h2>Pulihkan akun {selected.fullName}</h2>
      <p>Tanyakan langsung kepada pasien. Jangan membacakan data yang tersimpan sebelum pasien menjawab.</p>
      <form className="account-form" onSubmit={submit}>
        <label>NIK pasien<input name="nik" inputMode="numeric" pattern="[0-9]{16}" minLength={16} maxLength={16} required autoComplete="off" /></label>
        <label>Tanggal lahir<input name="dateOfBirth" type="date" required autoComplete="off" /></label>
        <label>Nomor telepon pasien<input name="phone" type="tel" inputMode="tel" minLength={8} maxLength={20} required autoComplete="off" /></label>
        <label>Password admin untuk konfirmasi<input name="adminPassword" type="password" required maxLength={72} autoComplete="current-password" /></label>
        <div className="header-actions-group">
          <button className="btn-secondary" disabled={busy} type="submit" name="action" value="identify">{busy ? "Memverifikasi…" : "Tampilkan email akun"}</button>
          <button className="btn-primary-action" disabled={busy} type="submit" name="action" value="reset">Buat password sementara</button>
          <button className="btn-secondary" type="button" disabled={busy} onClick={() => { setSelected(null); setResult(null); }}>Batal</button>
        </div>
      </form>
      {result && <div role="status" className="portal-notice recovery-result">
        <p><b>Email akun:</b> <span className="recovery-secret">{result.email}</span></p>
        {result.temporaryPassword && <><p><b>Password sementara:</b> <code className="recovery-secret">{result.temporaryPassword}</code></p><p>Sampaikan secara pribadi. Password ini hanya ditampilkan sekarang dan wajib diganti saat pasien masuk.</p></>}
      </div>}
    </section>}
  </div></AppLayout>;
}
