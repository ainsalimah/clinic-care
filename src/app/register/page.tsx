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
      <aside className="bg-gradient-to-br from-[#0B2D45] via-[#123F5D] to-[#2F80C0] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Dekorasi halus */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-sky-300/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-white font-extrabold text-xl tracking-tight font-jakarta"
          >
            <span className="w-9 h-9 rounded-xl bg-[#2F80C0] flex items-center justify-center text-white shadow-sm">
              <HeartPulse size={20} />
            </span>
            <span>
              Klinik<span className="text-[#9DD8FF]">Care</span>
            </span>
          </Link>

          <div className="mt-14 max-w-sm">
            <span className="inline-block text-[11px] font-bold tracking-widest text-[#9DD8FF] uppercase mb-3">
              MULAI DARI SINI
            </span>
            <h1 className="font-jakarta text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Perjalanan sehat Anda, lebih terencana.
            </h1>
            <p className="text-sm text-[#d5e6f2] leading-relaxed mb-8">
              Buat akun untuk melihat jadwal dokter dan mengajukan kunjungan. Petugas kami akan memeriksa setiap pengajuan dengan cermat.
            </p>

            <div className="flex flex-col gap-4 text-xs sm:text-sm text-[#e7f1f8]">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#9DD8FF] shrink-0">
                  <CalendarDays size={16} />
                </span>
                <span>Ajukan jadwal dokter dari rumah</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#9DD8FF] shrink-0">
                  <ShieldCheck size={16} />
                </span>
                <span>Akun baru mendapat nomor rekam medis</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#9DD8FF] shrink-0">
                  <UserRound size={16} />
                </span>
                <span>Portal dapat dicoba dengan akun pasien demo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-10 text-xs text-[#b7d1e3]">
          KlinikCare · Layanan rawat jalan modern & terpadu
        </div>
      </aside>

      {/* Sisi Kanan: Formulir Registrasi */}
      <section className="p-6 sm:p-10 lg:p-16 flex flex-col justify-between bg-[#f8fbfd]">
        <div className="w-full max-w-xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#5e7588] hover:text-[#2F80C0] font-medium transition-colors mb-8"
          >
            <ArrowLeft size={16} /> Kembali ke beranda
          </Link>

          <div>
            <span className="inline-block text-[11px] font-bold tracking-widest text-[#2F80C0] uppercase mb-1.5">
              AKUN PASIEN
            </span>
            <h2 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-[#0B2D45] tracking-tight mb-2">
              Buat akun pasien
            </h2>
            <p className="text-xs sm:text-sm text-[#5e7588] leading-relaxed mb-6">
              Gunakan data fiktif untuk mencoba pendaftaran. Pengaitan akun ke pasien lama belum tersedia pada versi demo ini.
            </p>
            <p className="text-sm text-[#5e7588] leading-relaxed mb-6">
              Sudah punya akun? <Link href="/login" className="font-semibold text-[#2F80C0] underline">Masuk di sini</Link>. Untuk mencoba tanpa mendaftar, <Link href="/#demo" className="font-semibold text-[#2F80C0] underline">pilih peran Pasien di demo</Link>.
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
                <label htmlFor="fullName" className="block text-xs font-bold text-[#0B2D45] uppercase tracking-wider mb-1.5">
                  Nama lengkap
                </label>
                <input
                  id="fullName" autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  required
                  maxLength={120}
                  placeholder="Sesuai kartu identitas (KTP / KK)"
                  className="w-full h-11 px-3.5 rounded-lg border border-[#c7d9e7] bg-white text-sm text-[#0B2D45] placeholder:text-[#8aa1b1] focus:outline-none focus:ring-2 focus:ring-[#2F80C0]/20 focus:border-[#2F80C0] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-[#0B2D45] uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    id="email" type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                    placeholder="nama@email.com"
                    className="w-full h-11 px-3.5 rounded-lg border border-[#c7d9e7] bg-white text-sm text-[#0B2D45] placeholder:text-[#8aa1b1] focus:outline-none focus:ring-2 focus:ring-[#2F80C0]/20 focus:border-[#2F80C0] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-[#0B2D45] uppercase tracking-wider mb-1.5">
                    Nomor telepon (WhatsApp)
                  </label>
                  <input
                    id="phone" type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    required
                    placeholder="08xxxxxxxxxx"
                    className="w-full h-11 px-3.5 rounded-lg border border-[#c7d9e7] bg-white text-sm text-[#0B2D45] placeholder:text-[#8aa1b1] focus:outline-none focus:ring-2 focus:ring-[#2F80C0]/20 focus:border-[#2F80C0] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nik" className="block text-xs font-bold text-[#0B2D45] uppercase tracking-wider mb-1.5">
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
                    className="w-full h-11 px-3.5 rounded-lg border border-[#c7d9e7] bg-white text-sm text-[#0B2D45] placeholder:text-[#8aa1b1] focus:outline-none focus:ring-2 focus:ring-[#2F80C0]/20 focus:border-[#2F80C0] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-xs font-bold text-[#0B2D45] uppercase tracking-wider mb-1.5">
                    Tanggal lahir
                  </label>
                  <input
                    id="dateOfBirth" type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => update("dateOfBirth", e.target.value)}
                    required
                    max={getClinicDateKey()}
                    className="w-full h-11 px-3.5 rounded-lg border border-[#c7d9e7] bg-white text-sm text-[#0B2D45] placeholder:text-[#8aa1b1] focus:outline-none focus:ring-2 focus:ring-[#2F80C0]/20 focus:border-[#2F80C0] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gender" className="block text-xs font-bold text-[#0B2D45] uppercase tracking-wider mb-1.5">
                    Jenis kelamin
                  </label>
                  <select id="gender"
                    value={form.gender}
                    onChange={(e) => update("gender", e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-[#c7d9e7] bg-white text-sm text-[#0B2D45] focus:outline-none focus:ring-2 focus:ring-[#2F80C0]/20 focus:border-[#2F80C0] transition-all"
                  >
                    <option value="UNKNOWN">Pilih jenis kelamin</option>
                    <option value="FEMALE">Perempuan</option>
                    <option value="MALE">Laki-laki</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-[#0B2D45] uppercase tracking-wider mb-1.5">
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
                    className="w-full h-11 px-3.5 rounded-lg border border-[#c7d9e7] bg-white text-sm text-[#0B2D45] placeholder:text-[#8aa1b1] focus:outline-none focus:ring-2 focus:ring-[#2F80C0]/20 focus:border-[#2F80C0] transition-all"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#edf7fd] border border-[#bcdcf2] text-xs text-[#315066] leading-relaxed">
                <span className="font-semibold">Verifikasi data:</span> NIK digunakan untuk memastikan data rekam medis tidak tercatat ganda. Permintaan kunjungan Anda akan dikonfirmasi oleh tim pendaftaran.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-[#2F80C0] hover:bg-[#2671AA] active:bg-[#1F5E91] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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

            <p className="text-center text-xs sm:text-sm text-[#5e7588] mt-5">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="text-[#2F80C0] font-bold hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-[#71899b] mt-10 pt-4 border-t border-[#dce8f0]">
          <LockKeyhole size={14} className="text-[#2F80C0]" />
          <span>Informasi kesehatan Anda dilindungi dan hanya digunakan untuk layanan medis internal.</span>
        </div>
      </section>
    </main>
  );
}
