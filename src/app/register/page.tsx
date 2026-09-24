"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, HeartPulse, Loader2, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { getClinicDateKey } from "@/lib/clinic-time";

export default function PatientRegistrationPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", nik: "", dateOfBirth: "", gender: "UNKNOWN", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Pendaftaran belum berhasil."); setLoading(false); return; }
      localStorage.setItem("cliniccare_role", "Pasien");
      localStorage.setItem("cliniccare_user", JSON.stringify(data.user));
      document.cookie = `cliniccare_role_name=${encodeURIComponent("Pasien")}; path=/; max-age=604800; SameSite=Lax`;
      router.push("/patient?welcome=1");
      router.refresh();
    } catch {
      setError("Koneksi terputus. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <main className="patient-auth-page">
      <aside className="patient-auth-aside">
        <Link className="public-brand" href="/"><span className="public-brand-icon"><HeartPulse size={21} /></span><span>Klinik<span>Care</span></span></Link>
        <div className="patient-auth-message"><span className="public-eyebrow">MULAI DARI SINI</span><h1>Perjalanan sehat Anda, lebih terencana.</h1><p>Buat akun untuk melihat jadwal dokter dan mengajukan kunjungan. Petugas kami akan memeriksa setiap pengajuan.</p><div className="patient-auth-points"><span><CalendarDays size={17} /> Ajukan jadwal dari rumah</span><span><ShieldCheck size={17} /> Data identitas terhubung ke nomor RM</span><span><UserRound size={17} /> Pasien lama dapat menghubungkan data yang ada</span></div></div>
        <small className="auth-aside-foot">KlinikCare · Layanan rawat jalan</small>
      </aside>

      <section className="patient-auth-form-area">
        <Link className="auth-back-link" href="/"><ArrowLeft size={16} /> Kembali ke beranda</Link>
        <div className="patient-auth-form-wrap">
          <span className="public-eyebrow">AKUN PASIEN</span>
          <h2>Buat akun pasien</h2>
          <p className="auth-form-subtitle">Isi data sesuai identitas. Jika sudah punya nomor RM, gunakan NIK dan tanggal lahir yang sama agar data dapat dihubungkan.</p>
          {error && <div className="patient-form-error" role="alert">{error}</div>}
          <form onSubmit={submit} className="patient-register-form">
            <label>Nama lengkap<input autoComplete="name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required maxLength={120} placeholder="Sesuai identitas" /></label>
            <div className="patient-form-two">
              <label>Email<input type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} required placeholder="nama@email.com" /></label>
              <label>Nomor telepon<input type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} required placeholder="08xxxxxxxxxx" /></label>
            </div>
            <div className="patient-form-two">
              <label>NIK<input inputMode="numeric" maxLength={16} value={form.nik} onChange={(e) => update("nik", e.target.value.replace(/\D/g, ""))} required placeholder="16 digit" /></label>
              <label>Tanggal lahir<input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} required max={getClinicDateKey()} /></label>
            </div>
            <div className="patient-form-two">
              <label>Jenis kelamin<select value={form.gender} onChange={(e) => update("gender", e.target.value)}><option value="UNKNOWN">Pilih / belum diketahui</option><option value="FEMALE">Perempuan</option><option value="MALE">Laki-laki</option></select></label>
              <label>Kata sandi<input type="password" autoComplete="new-password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} placeholder="Minimal 8 karakter" /></label>
            </div>
            <p className="patient-data-note">NIK digunakan untuk mencegah pembuatan rekam medis ganda. Pengajuan kunjungan tetap menunggu verifikasi resepsionis.</p>
            <button className="public-button-primary patient-submit" type="submit" disabled={loading}>{loading ? <><Loader2 size={17} className="spinner" /> Membuat akun…</> : <>Buat akun & lanjut <ArrowRight size={17} /></>}</button>
          </form>
          <p className="auth-existing">Sudah punya akun? <Link href="/login">Masuk di sini</Link></p>
        </div>
        <div className="patient-auth-secure"><LockKeyhole size={14} /> Informasi kesehatan hanya digunakan untuk proses layanan klinik.</div>
      </section>
    </main>
  );
}
