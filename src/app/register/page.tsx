"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  HeartPulse,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getClinicDateKey } from "@/lib/clinic-time";

export default function PatientRegistrationPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    nik: "",
    dateOfBirth: "",
    gender: "UNKNOWN",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Pendaftaran belum berhasil.");
        setLoading(false);
        return;
      }
      localStorage.setItem("cliniccare_role", "Pasien");
      localStorage.setItem("cliniccare_user", JSON.stringify(data.user));
      document.cookie = `cliniccare_role_name=${encodeURIComponent(
        "Pasien"
      )}; path=/; max-age=604800; SameSite=Lax`;
      router.push("/patient?welcome=1");
      router.refresh();
    } catch {
      setError("Koneksi terputus. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[440px_1fr] bg-white">
      {/* Sisi Kiri: Branding & Informasi */}
      <aside className="bg-gradient-to-br from-[#12394a] via-[#104b4f] to-[#0b605a] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Dekorasi halus */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-white font-extrabold text-xl tracking-tight font-jakarta"
          >
            <span className="w-9 h-9 rounded-xl bg-[#27a994] flex items-center justify-center text-white shadow-sm">
              <HeartPulse size={20} />
            </span>
            <span>
              Klinik<span className="text-[#68ddc4]">Care</span>
            </span>
          </Link>

          <div className="mt-14 max-w-sm">
            <span className="inline-block text-[11px] font-bold tracking-widest text-[#7ce2ce] uppercase mb-3">
              MULAI DARI SINI
            </span>
            <h1 className="font-jakarta text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Perjalanan sehat Anda, lebih terencana.
            </h1>
            <p className="text-sm text-[#c2dad9] leading-relaxed mb-8">
              Buat akun untuk melihat jadwal dokter dan mengajukan kunjungan. Petugas kami akan memeriksa setiap pengajuan dengan cermat.
            </p>

            <div className="flex flex-col gap-4 text-xs sm:text-sm text-[#e2f2ef]">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-teal-800/40 flex items-center justify-center text-[#73dfca] shrink-0">
                  <CalendarDays size={16} />
                </span>
                <span>Ajukan jadwal dokter dari rumah</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-teal-800/40 flex items-center justify-center text-[#73dfca] shrink-0">
                  <ShieldCheck size={16} />
                </span>
                <span>Pengaitan nomor RM diverifikasi resepsionis</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-teal-800/40 flex items-center justify-center text-[#73dfca] shrink-0">
                  <UserRound size={16} />
                </span>
                <span>Pasien lama dibantu petugas klinik</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-10 text-xs text-[#91b3b4]">
          KlinikCare · Layanan rawat jalan modern & terpadu
        </div>
      </aside>

      {/* Sisi Kanan: Formulir Registrasi */}
      <section className="p-6 sm:p-10 lg:p-16 flex flex-col justify-between bg-[#fafcfb]">
        <div className="w-full max-w-xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#5f7478] hover:text-[#0b605a] font-medium transition-colors mb-8"
          >
            <ArrowLeft size={16} /> Kembali ke beranda
          </Link>

          <div>
            <span className="inline-block text-[11px] font-bold tracking-widest text-[#0f8779] uppercase mb-1.5">
              AKUN PASIEN
            </span>
            <h2 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-[#173c38] tracking-tight mb-2">
              Buat akun pasien
            </h2>
            <p className="text-xs sm:text-sm text-[#637975] leading-relaxed mb-6">
              Isi data sesuai identitas resmi. Jika data Anda sudah tercatat, hubungi resepsionis untuk verifikasi dan pengaitan akun.
            </p>

            {error && (
              <div
                className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium leading-relaxed"
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-[#1f4a42] uppercase tracking-wider mb-1.5">
                  Nama lengkap
                </label>
                <input
                  id="fullName" autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  required
                  maxLength={120}
                  placeholder="Sesuai kartu identitas (KTP / KK)"
                  className="w-full h-11 px-3.5 rounded-lg border border-[#cadad4] bg-white text-sm text-[#143c34] placeholder:text-[#94a8a2] focus:outline-none focus:ring-2 focus:ring-[#0f8779]/20 focus:border-[#0f8779] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-[#1f4a42] uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    id="email" type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                    placeholder="nama@email.com"
                    className="w-full h-11 px-3.5 rounded-lg border border-[#cadad4] bg-white text-sm text-[#143c34] placeholder:text-[#94a8a2] focus:outline-none focus:ring-2 focus:ring-[#0f8779]/20 focus:border-[#0f8779] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-[#1f4a42] uppercase tracking-wider mb-1.5">
                    Nomor telepon (WhatsApp)
                  </label>
                  <input
                    id="phone" type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    required
                    placeholder="08xxxxxxxxxx"
                    className="w-full h-11 px-3.5 rounded-lg border border-[#cadad4] bg-white text-sm text-[#143c34] placeholder:text-[#94a8a2] focus:outline-none focus:ring-2 focus:ring-[#0f8779]/20 focus:border-[#0f8779] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nik" className="block text-xs font-bold text-[#1f4a42] uppercase tracking-wider mb-1.5">
                    NIK (16 Digit)
                  </label>
                  <input
                    id="nik" inputMode="numeric"
                    maxLength={16}
                    value={form.nik}
                    onChange={(e) =>
                      update("nik", e.target.value.replace(/\D/g, ""))
                    }
                    required
                    placeholder="16 digit NIK"
                    className="w-full h-11 px-3.5 rounded-lg border border-[#cadad4] bg-white text-sm text-[#143c34] placeholder:text-[#94a8a2] focus:outline-none focus:ring-2 focus:ring-[#0f8779]/20 focus:border-[#0f8779] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-xs font-bold text-[#1f4a42] uppercase tracking-wider mb-1.5">
                    Tanggal lahir
                  </label>
                  <input
                    id="dateOfBirth" type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => update("dateOfBirth", e.target.value)}
                    required
                    max={getClinicDateKey()}
                    className="w-full h-11 px-3.5 rounded-lg border border-[#cadad4] bg-white text-sm text-[#143c34] placeholder:text-[#94a8a2] focus:outline-none focus:ring-2 focus:ring-[#0f8779]/20 focus:border-[#0f8779] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gender" className="block text-xs font-bold text-[#1f4a42] uppercase tracking-wider mb-1.5">
                    Jenis kelamin
                  </label>
                  <select id="gender"
                    value={form.gender}
                    onChange={(e) => update("gender", e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-[#cadad4] bg-white text-sm text-[#143c34] focus:outline-none focus:ring-2 focus:ring-[#0f8779]/20 focus:border-[#0f8779] transition-all"
                  >
                    <option value="UNKNOWN">Pilih jenis kelamin</option>
                    <option value="FEMALE">Perempuan</option>
                    <option value="MALE">Laki-laki</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-[#1f4a42] uppercase tracking-wider mb-1.5">
                    Kata sandi
                  </label>
                  <input
                    id="password" type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter"
                    className="w-full h-11 px-3.5 rounded-lg border border-[#cadad4] bg-white text-sm text-[#143c34] placeholder:text-[#94a8a2] focus:outline-none focus:ring-2 focus:ring-[#0f8779]/20 focus:border-[#0f8779] transition-all"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#edf6f3] border border-[#d6eae2] text-xs text-[#31584e] leading-relaxed">
                <span className="font-semibold">Catatan Keamanan:</span> NIK digunakan untuk mencegah duplikasi rekam medis. Pengajuan kunjungan dokter tetap akan diverifikasi langsung oleh tim resepsionis klinik.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-[#0b605a] hover:bg-[#084843] active:bg-[#063834] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Mendaftarkan akun…</span>
                  </>
                ) : (
                  <>
                    <span>Buat akun & lanjut</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs sm:text-sm text-[#637975] mt-5">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="text-[#0b605a] font-bold hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-[#7d938f] mt-10 pt-4 border-t border-[#e2ece8]">
          <LockKeyhole size={14} className="text-[#0b605a]" />
          <span>Informasi kesehatan Anda dilindungi dan hanya digunakan untuk layanan medis internal.</span>
        </div>
      </section>
    </main>
  );
}
