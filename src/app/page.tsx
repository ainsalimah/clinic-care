"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  HeartPulse,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  UserCheck,
  Users,
  X,
} from "lucide-react";

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  quota: number;
}

interface Doctor {
  id: string;
  fullName: string;
  specialization: string | null;
  schedules: Schedule[];
}

interface Department {
  id: string;
  name: string;
  description: string | null;
  doctors: Doctor[];
}

const weekdayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const faqs = [
  [
    "Apakah pasien baru bisa membuat janji secara online?",
    "Bisa. Cukup buat akun pasien di KlinikCare, lengkapi identitas dasar, lalu pilih poli, dokter, dan tanggal kunjungan yang Anda kehendaki.",
  ],
  [
    "Apakah pendaftaran online langsung mendapatkan nomor antrean?",
    "Nomor antrean fisik diterbitkan saat Anda tiba di klinik dan melakukan check-in pada hari kunjungan, sehingga antrean tetap tertib dan adil.",
  ],
  [
    "Bagaimana jika pasien lansia ingin datang langsung tanpa daftar online?",
    "Sangat diperbolehkan. Staf resepsionis kami siap membantu pendaftaran manual langsung di meja penerimaan tanpa memerlukan smartphone.",
  ],
  [
    "Apakah rekam medis dan resep obat terintegrasi?",
    "Ya. Setelah pemeriksaan oleh dokter, diagnosa dan resep otomatis diteruskan secara digital ke bagian farmasi klinik untuk segera disiapkan.",
  ],
];

const testimonials = [
  {
    name: "Sari Wulandari",
    role: "Ibu Rumah Tangga (Pasien Poli Anak)",
    text: "Pendaftaran online sangat menghemat waktu! Dokternya sangat ramah dan sabar memeriksa anak saya. Tidak perlu antre berjam-jam seperti di klinik lain.",
    avatar: "/api/images/doctor-nadia.jpg",
    rating: 5,
  },
  {
    name: "Bapak Marto Suwito",
    role: "Pasien Lansia (Poli Umum)",
    text: "Saya datang langsung tanpa bawa HP dan tetap dilayani dengan sangat sopan oleh resepsionis. Petugasnya ramah dan obat langsung siap diambil di apotek.",
    avatar: "/api/images/doctor-bambang.jpg",
    rating: 5,
  },
  {
    name: "Ibu Siti Aminah",
    role: "Pasien Poli Penyakit Dalam",
    text: "Penjelasan dokter sangat detail mengenai lambung dan pola makan saya. Rekam medis tersimpan rapi sehingga jadwal kontrol lanjutan jadi sangat praktis.",
    avatar: "/api/images/doctor-maya.jpg",
    rating: 5,
  },
];

function getDoctorImage(fullName: string, departmentName?: string): string {
  const name = fullName.toLowerCase();
  if (name.includes("hendra")) return "/api/images/doctor-hendra.jpg";
  if (name.includes("maya")) return "/api/images/doctor-maya.jpg";
  if (name.includes("fadhil") || name.includes("gigi")) return "/api/images/doctor-fadhil.jpg";
  if (name.includes("bambang") || name.includes("dalam")) return "/api/images/doctor-bambang.jpg";
  if (name.includes("nadia") || name.includes("safitri")) return "/api/images/doctor-nadia.jpg";

  if (departmentName?.toLowerCase().includes("anak")) return "/api/images/doctor-maya.jpg";
  if (departmentName?.toLowerCase().includes("gigi")) return "/api/images/doctor-fadhil.jpg";
  if (departmentName?.toLowerCase().includes("dalam")) return "/api/images/doctor-bambang.jpg";
  return "/api/images/doctor-hendra.jpg";
}

export default function PublicHomePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/public/catalog")
      .then((response) => response.json())
      .then((data) => setDepartments(data.departments ?? []))
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, []);

  const allDoctors = useMemo(
    () =>
      departments.flatMap((department) =>
        department.doctors.map((doctor) => ({
          ...doctor,
          departmentName: department.name,
          departmentId: department.id,
        }))
      ),
    [departments]
  );

  const filteredDoctors = useMemo(() => {
    const keyword = searchDoctor.trim().toLocaleLowerCase("id-ID");
    return allDoctors.filter((doctor) => {
      const matchesDepartment =
        selectedDeptFilter === "ALL" || doctor.departmentId === selectedDeptFilter;
      const matchesKeyword =
        !keyword ||
        [doctor.fullName, doctor.specialization, doctor.departmentName]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase("id-ID").includes(keyword));
      return matchesDepartment && matchesKeyword;
    });
  }, [allDoctors, searchDoctor, selectedDeptFilter]);

  return (
    <main className="min-h-screen bg-white text-[#153c35]">
      {/* Top Header Information Bar */}
      <div className="border-b border-[#dce7df] bg-[#f4f8f5] text-xs text-[#3f6358]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-2.5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Sparkles size={13} className="text-[#187560]" />
              Kesehatan Anda, Prioritas & Dedikasi Kami
            </span>
            <span className="hidden text-[#a6c1b6] sm:inline">|</span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Clock3 size={13} className="text-[#187560]" />
              Senin–Jumat, 08.00–21.00 WIB
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#185e50]">
              <Phone size={13} className="text-[#187560]" />
              (022) 8765-4321
            </span>
            <Link
              href="/register"
              className="inline-flex items-center gap-1 font-bold text-[#145c4d] hover:underline"
            >
              Daftar online <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[#e1eae3] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" aria-label="KlinikCare beranda" className="flex items-center gap-2.5">
            <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[#187560] to-[#104e41] text-white shadow-sm">
              <HeartPulse size={23} />
            </span>
            <span className="leading-tight">
              <span className="block font-jakarta text-2xl font-black tracking-[-0.06em] text-[#143c34]">
                Klinik<span className="text-[#187560]">Care</span>
              </span>
              <span className="block pt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#6f897e]">
                Rawat Jalan & Farmasi
              </span>
            </span>
          </Link>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-lg border border-[#d6e3da] text-[#21564b] md:hidden"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#layanan" className="text-sm font-semibold text-[#486b61] transition hover:text-[#187560]">
              Layanan
            </a>
            <a href="#tentang" className="text-sm font-semibold text-[#486b61] transition hover:text-[#187560]">
              Tentang Kami
            </a>
            <a href="#dokter" className="text-sm font-semibold text-[#486b61] transition hover:text-[#187560]">
              Tim Dokter
            </a>
            <a href="#kunjungan" className="text-sm font-semibold text-[#486b61] transition hover:text-[#187560]">
              Alur Pasien
            </a>
            <a href="#testimoni" className="text-sm font-semibold text-[#486b61] transition hover:text-[#187560]">
              Testimoni
            </a>
            <a href="#faq" className="text-sm font-semibold text-[#486b61] transition hover:text-[#187560]">
              FAQ
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#235347] transition hover:bg-[#eff6f1]"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#145c4d] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0e483c] hover:shadow-md"
            >
              Buat Janji Online <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-[#e3ebe5] bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {[
                ["#layanan", "Layanan"],
                ["#tentang", "Tentang Kami"],
                ["#dokter", "Tim Dokter"],
                ["#kunjungan", "Alur Pasien"],
                ["#testimoni", "Testimoni"],
                ["#faq", "FAQ"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#375e53] hover:bg-[#f3f7f3]"
                >
                  {label}
                </a>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#e3ebe5] pt-3">
                <Link
                  href="/login"
                  className="rounded-lg border border-[#d5e2da] px-3 py-2.5 text-center text-sm font-semibold text-[#245448]"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[#145c4d] px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Buat janji
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Hero Section with Modern Building Photo */}
      <section className="relative overflow-hidden border-b border-[#e1ebe4] bg-gradient-to-b from-[#f8faf8] to-[#edf4f0] py-12 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cbe1d4] bg-[#e8f4ec] px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-[#166e5a]">
              <Sparkles size={14} className="text-[#187560]" />
              Selamat Datang di KlinikCare
            </div>

            <h1 className="mt-5 font-jakarta text-4xl font-extrabold leading-[1.12] tracking-[-0.05em] text-[#143c34] sm:text-5xl lg:text-[3.5rem]">
              Perawatan Medis Terpercaya. <br className="hidden sm:inline" />
              <span className="text-[#187560]">Setiap Saat.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#516f64] sm:text-lg">
              Pelayanan rawat jalan penuh kepedulian didukung teknologi rekam medis terpadu.
              Konsultasi dokter umum, spesialis anak, gigi, dan penyakit dalam dengan jadwal
              yang pasti dan terpercaya.
            </p>

            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[#145c4d] px-6 text-sm font-bold text-white shadow-md transition hover:bg-[#0e483c] hover:shadow-lg"
              >
                Buat Janji Rawat Jalan <ArrowRight size={17} />
              </Link>
              <a
                href="#dokter"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-[#c4d7cc] bg-white px-6 text-sm font-bold text-[#1f4e42] shadow-sm transition hover:border-[#187560] hover:bg-[#f8fbf9]"
              >
                Lihat Jadwal Dokter <Search size={16} />
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-[#d8e6dc] pt-6 sm:grid-cols-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="shrink-0 text-[#187560]" />
                <span className="text-xs font-semibold text-[#44665a]">Dokter Ber-SIP Resmi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="shrink-0 text-[#187560]" />
                <span className="text-xs font-semibold text-[#44665a]">Rekam Medis Terpadu</span>
              </div>
              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <UserCheck size={18} className="shrink-0 text-[#187560]" />
                <span className="text-xs font-semibold text-[#44665a]">Ramah Pasien Walk-in</span>
              </div>
            </div>
          </div>

          {/* Hero Image Card */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-[#d6e5db] bg-white p-2.5 shadow-2xl">
              <div className="relative h-[360px] w-full overflow-hidden rounded-2xl sm:h-[430px]">
                <img
                  src="/api/images/clinic-hero.jpg"
                  alt="Gedung Klinik Modern KlinikCare"
                  className="h-full w-full object-cover object-center transition duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                {/* Overlaid Badges */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-white/30 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-[#144439] shadow-lg backdrop-blur-md">
                  <Star size={14} className="fill-[#eab308] text-[#eab308]" />
                  <span>4.9 / 5.0 Kepuasan Pasien</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-md">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 place-items-center rounded-xl bg-[#e5f4ec] text-[#187560]">
                        <HeartPulse size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#187560]">
                          Pelayanan Rawat Jalan
                        </p>
                        <p className="font-jakarta text-sm font-extrabold text-[#143c34]">
                          Konsultasi Medis & Farmasi Siap Ambil
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/register"
                      className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#145c4d] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0e483c]"
                    >
                      Daftar <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight Cards Strip (4 Highlights like MediLife reference) */}
      <section className="border-b border-[#e1eae3] bg-white py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-4 rounded-2xl border border-[#e5ede7] bg-[#fbfdfb] p-5 transition hover:border-[#b8d8c5] hover:shadow-sm">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e6f4ed] text-[#187560]">
                <Clock3 size={24} />
              </span>
              <div>
                <h3 className="font-jakarta text-sm font-bold text-[#173e35]">Layanan Terjadwal</h3>
                <p className="mt-1 text-xs leading-5 text-[#587368]">
                  Senin–Jumat dengan kepastian jam praktik dan nomor antrean yang tertata rapi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-[#e5ede7] bg-[#fbfdfb] p-5 transition hover:border-[#b8d8c5] hover:shadow-sm">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e6f4ed] text-[#187560]">
                <Stethoscope size={24} />
              </span>
              <div>
                <h3 className="font-jakarta text-sm font-bold text-[#173e35]">Dokter Berpengalaman</h3>
                <p className="mt-1 text-xs leading-5 text-[#587368]">
                  Praktisi medis terakreditasi dan berdedikasi memberikan diagnosis yang akurat.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-[#e5ede7] bg-[#fbfdfb] p-5 transition hover:border-[#b8d8c5] hover:shadow-sm">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e6f4ed] text-[#187560]">
                <Activity size={24} />
              </span>
              <div>
                <h3 className="font-jakarta text-sm font-bold text-[#173e35]">Rekam Medis Digital</h3>
                <p className="mt-1 text-xs leading-5 text-[#587368]">
                  Riwayat kunjungan, diagnosa, dan resep obat tersimpan aman dan terintegrasi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-[#e5ede7] bg-[#fbfdfb] p-5 transition hover:border-[#b8d8c5] hover:shadow-sm">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e6f4ed] text-[#187560]">
                <Users size={24} />
              </span>
              <div>
                <h3 className="font-jakarta text-sm font-bold text-[#173e35]">Pendekatan Humanis</h3>
                <p className="mt-1 text-xs leading-5 text-[#587368]">
                  Ramah untuk pasien lansia dan siap membantu pasien datang langsung (walk-in).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties / Layanan Klinik */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24" id="layanan">
        <div className="flex flex-col gap-4 border-b border-[#dfe8e1] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#187560]">
              Layanan & Spesialisasi
            </p>
            <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-[-0.04em] text-[#143c34] sm:text-4xl">
              Pilihan Poli Sesuai Kebutuhan Anda
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#5b766c]">
            Dapatkan perawatan komprehensif dari dokter umum hingga spesialis dengan fasilitas pemeriksaan yang bersih dan nyaman.
          </p>
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-[#667c72]">Memuat data layanan klinik…</p>
        ) : departments.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((department) => (
              <article
                key={department.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#dde7df] bg-white p-6 shadow-sm transition hover:border-[#96cbb2] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-xl bg-[#edf6f0] text-[#187560] transition group-hover:bg-[#187560] group-hover:text-white">
                      <Stethoscope size={22} />
                    </span>
                    <span className="rounded-full bg-[#f0f6f2] px-2.5 py-1 text-[11px] font-bold text-[#2d6c5c]">
                      {department.doctors.length} Dokter
                    </span>
                  </div>

                  <h3 className="mt-5 font-jakarta text-xl font-bold tracking-tight text-[#164137]">
                    {department.name}
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-[#627b70]">
                    {department.description ||
                      "Konsultasi dan pemeriksaan rawat jalan bersama tim medis klinik terpercaya."}
                  </p>
                </div>

                <div className="mt-6 border-t border-[#edf2ee] pt-4">
                  <Link
                    href={`/register?dept=${department.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#187560] group-hover:underline"
                  >
                    Daftar ke Poli Ini <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-8 border border-dashed border-[#cbd9d0] p-10 text-center text-sm text-[#667c72]">
            Informasi layanan sedang diperbarui.
          </p>
        )}
      </section>

      {/* About Section: Healing Hands. Caring Hearts. (Directly matching user's image) */}
      <section className="border-y border-[#dfebdf] bg-[#f7f9f7] py-16 lg:py-24" id="tentang">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10">
          {/* Medical Team Photo */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-[#d3e3d8] bg-white p-3 shadow-xl">
              <div className="relative h-[360px] w-full overflow-hidden rounded-2xl sm:h-[420px]">
                <img
                  src="/api/images/medical-team.jpg"
                  alt="Tim Medis KlinikCare"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <Award size={20} className="text-[#187560]" />
                    <span className="text-xs font-bold text-[#15443a]">
                      Tim Medis Bersertifikat Resmi Indonesia
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Text & Stats */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#187560]">
              Tentang KlinikCare
            </p>
            <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-[-0.04em] text-[#143c34] sm:text-4xl">
              Tangan yang Menyembuhkan, <br />
              <span className="text-[#187560]">Hati yang Peduli.</span>
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#527065] sm:text-base">
              Di KlinikCare, kami berkomitmen menghadirkan layanan kesehatan yang berorientasi
              pada kenyamanan pasien. Didukung oleh tim dokter berpengalaman, sistem rekam medis
              digital yang transparan, dan instalasi farmasi terpadu untuk memastikan Anda
              dan keluarga mendapatkan perawatan terbaik.
            </p>

            {/* 4 Stats Grid (like MediLife reference) */}
            <div className="mt-8 grid grid-cols-2 gap-5 border-y border-[#dce8df] py-6">
              <div className="flex items-center gap-3.5">
                <span className="grid size-12 place-items-center rounded-xl bg-[#e5f4ec] text-[#187560]">
                  <Award size={22} />
                </span>
                <div>
                  <p className="font-jakarta text-2xl font-black tracking-tight text-[#143c34]">10+</p>
                  <p className="text-xs font-semibold text-[#5a766c]">Tahun Pengalaman</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <span className="grid size-12 place-items-center rounded-xl bg-[#e5f4ec] text-[#187560]">
                  <UserCheck size={22} />
                </span>
                <div>
                  <p className="font-jakarta text-2xl font-black tracking-tight text-[#143c34]">100%</p>
                  <p className="text-xs font-semibold text-[#5a766c]">Dokter Ber-SIP Resmi</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <span className="grid size-12 place-items-center rounded-xl bg-[#e5f4ec] text-[#187560]">
                  <Stethoscope size={22} />
                </span>
                <div>
                  <p className="font-jakarta text-2xl font-black tracking-tight text-[#143c34]">4</p>
                  <p className="text-xs font-semibold text-[#5a766c]">Poli Rawat Jalan</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <span className="grid size-12 place-items-center rounded-xl bg-[#e5f4ec] text-[#187560]">
                  <Users size={22} />
                </span>
                <div>
                  <p className="font-jakarta text-2xl font-black tracking-tight text-[#143c34]">15.000+</p>
                  <p className="text-xs font-semibold text-[#5a766c]">Pasien Terlayani</p>
                </div>
              </div>
            </div>

            <div className="mt-7">
              <a
                href="#dokter"
                className="inline-flex items-center gap-2 font-bold text-[#187560] hover:underline"
              >
                Lihat Semua Profil Dokter Kami <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Section with Real Doctor Portraits */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24" id="dokter">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#187560]">
              Tim Dokter Kami
            </p>
            <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-[-0.04em] text-[#143c34] sm:text-4xl">
              Profil dan Jadwal Praktik Dokter
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#5c776d]">
            Cari dokter berdasarkan nama, keahlian, atau poli dan lihat jadwal praktik aktif.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-8 grid gap-3 rounded-2xl border border-[#d7e5dc] bg-[#f9fbf9] p-3 sm:grid-cols-[1fr_240px] sm:p-4">
          <label className="relative block">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#648076]"
            />
            <input
              value={searchDoctor}
              onChange={(event) => setSearchDoctor(event.target.value)}
              placeholder="Cari nama dokter atau keahlian (contoh: dr. Hendra, Anak, Gigi...)"
              className="h-12 w-full rounded-xl border border-[#d5e2d9] bg-white pl-11 pr-4 text-sm text-[#183f36] outline-none placeholder:text-[#889b93] focus:border-[#187560] focus:ring-2 focus:ring-[#d8eee4]"
            />
          </label>
          <select
            value={selectedDeptFilter}
            onChange={(event) => setSelectedDeptFilter(event.target.value)}
            aria-label="Filter poli"
            className="h-12 rounded-xl border border-[#d5e2d9] bg-white px-4 text-sm font-semibold text-[#255246] outline-none focus:border-[#187560] focus:ring-2 focus:ring-[#d8eee4]"
          >
            <option value="ALL">Semua Poli Layanan</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        {/* Doctors Cards Grid */}
        {loading ? (
          <p className="py-16 text-center text-sm text-[#667c72]">Memuat profil dokter…</p>
        ) : filteredDoctors.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredDoctors.map((doctor) => {
              const photoUrl = getDoctorImage(doctor.fullName, doctor.departmentName);

              return (
                <article
                  key={doctor.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#dce7df] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#187560] hover:shadow-xl"
                >
                  {/* Doctor Image Header */}
                  <div className="relative h-60 w-full overflow-hidden bg-[#eef4f0]">
                    <img
                      src={photoUrl}
                      alt={doctor.fullName}
                      className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 rounded-full bg-[#145c4d]/90 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                      {doctor.departmentName}
                    </span>
                    <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#145c4d] shadow-sm backdrop-blur-md">
                      <span className="size-2 rounded-full bg-[#187560] animate-pulse" />
                      Praktik Aktif
                    </span>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-jakarta text-lg font-bold text-white drop-shadow-sm">
                        {doctor.fullName}
                      </h3>
                      <p className="text-xs font-medium text-[#d1ece1]">
                        {doctor.specialization || "Dokter Praktik"}
                      </p>
                    </div>
                  </div>

                  {/* Doctor Schedule & Info */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#557569]">
                        <CalendarDays size={14} className="text-[#187560]" />
                        Jadwal Praktik
                      </div>

                      {doctor.schedules.length ? (
                        <ul className="space-y-1.5">
                          {doctor.schedules.slice(0, 3).map((schedule) => (
                            <li
                              key={schedule.id}
                              className="flex items-center justify-between rounded-lg bg-[#f6faf7] px-2.5 py-1.5 text-xs text-[#526e63]"
                            >
                              <span className="font-semibold text-[#1f4e42]">
                                {weekdayNames[schedule.dayOfWeek]}
                              </span>
                              <span className="font-medium text-[#527166]">
                                {schedule.startTime}–{schedule.endTime}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-[#74877e]">Jadwal belum tersedia.</p>
                      )}
                    </div>

                    <Link
                      href="/register"
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#edf6f1] py-2.5 text-xs font-bold text-[#145c4d] transition hover:bg-[#145c4d] hover:text-white"
                    >
                      Ajukan Jadwal Temu <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[#cbd9d0] bg-white p-12 text-center">
            <Search size={28} className="mx-auto text-[#6b857a]" />
            <p className="mt-3 text-sm font-bold text-[#275347]">
              Dokter tidak ditemukan untuk pencarian ini
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchDoctor("");
                setSelectedDeptFilter("ALL");
              }}
              className="mt-3 text-xs font-bold text-[#187560] hover:underline"
            >
              Reset filter pencarian
            </button>
          </div>
        )}
      </section>

      {/* Patient Testimonials (Trusted by Thousands - like MediLife reference) */}
      <section className="border-y border-[#dfebdf] bg-[#f8faf8] py-16 lg:py-24" id="testimoni">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#187560]">
              Cerita & Ulasan Pasien
            </p>
            <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-[-0.04em] text-[#143c34] sm:text-4xl">
              Dipercaya oleh Ribuan Pasien & Keluarga
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[#5a766c]">
              Pengalaman nyata dari mereka yang telah mempercayakan kesehatan keluarganya di KlinikCare.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col justify-between rounded-2xl border border-[#dde7df] bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#eab308]">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-[#eab308]" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[#516f64] italic">
                    “{testimonial.text}”
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-[#edf2ee] pt-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="size-11 rounded-full border border-[#cbe1d4] object-cover"
                  />
                  <div>
                    <b className="block text-sm font-bold text-[#164137]">{testimonial.name}</b>
                    <small className="text-xs text-[#6e877d]">{testimonial.role}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guide & Flow Section */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24" id="kunjungan">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#187560]">
              Panduan Kunjungan
            </p>
            <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-[-0.04em] text-[#143c34] sm:text-4xl">
              Dua Cara Nyaman Memulai Pelayanan.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#577368]">
              Pendaftaran online memudahkan Anda merencanakan waktu periksa. Sementara pasien yang
              memilih datang langsung tetap dilayani dengan ramah oleh petugas meja pendaftaran.
            </p>
            <div className="mt-7 rounded-xl border-l-4 border-[#187560] bg-[#f2f8f4] p-4 text-sm leading-6 text-[#45695d]">
              Nomor antrean resmi diterbitkan saat Anda melakukan <b>check-in</b> di resepsionis pada
              hari kunjungan.
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <article className="rounded-2xl border border-[#d9e6dd] bg-[#fbfdfb] p-6 shadow-sm">
              <span className="grid size-12 place-items-center rounded-xl bg-[#e6f4ec] text-[#187560]">
                <CalendarDays size={22} />
              </span>
              <h3 className="mt-5 font-jakarta text-xl font-bold text-[#143c34]">Daftar Online</h3>
              <p className="mt-2 text-sm leading-6 text-[#5b756b]">
                Buat akun, tentukan poli, dokter pilihan, dan pilih tanggal praktik yang cocok dari
                rumah.
              </p>
              <Link
                href="/register"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#187560] hover:underline"
              >
                Mulai Pendaftaran <ArrowRight size={15} />
              </Link>
            </article>

            <article className="rounded-2xl border border-[#d9e6dd] bg-[#fbfdfb] p-6 shadow-sm">
              <span className="grid size-12 place-items-center rounded-xl bg-[#e6f4ec] text-[#187560]">
                <Users size={22} />
              </span>
              <h3 className="mt-5 font-jakarta text-xl font-bold text-[#143c34]">Datang Langsung</h3>
              <p className="mt-2 text-sm leading-6 text-[#5b756b]">
                Bantuan meja resepsionis untuk mencari data pasien lama atau registrasi pasien baru di
                tempat.
              </p>
              <a
                href="#alur"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#187560] hover:underline"
              >
                Lihat Alur Pelayanan <ArrowRight size={15} />
              </a>
            </article>
          </div>
        </div>

        {/* 3 Steps Alur */}
        <div className="mt-16 border-t border-[#dde7df] pt-12" id="alur">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#187560]">
            Alur Pelayanan Pasien
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              [
                "01",
                "Ajukan / Registrasi Kunjungan",
                "Pilih pendaftaran online dari website atau dapatkan bantuan langsung dari meja resepsionis.",
              ],
              [
                "02",
                "Check-in & Dapatkan Antrean",
                "Petugas memvalidasi kedatangan Anda dan mencetak nomor antrean poli tujuan.",
              ],
              [
                "03",
                "Pemeriksaan Dokter & Farmasi",
                "Dokter memeriksa keluhan Anda, lalu resep diteruskan ke farmasi untuk penyiapan obat.",
              ],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="flex items-start gap-5 rounded-2xl border border-[#e4ede6] bg-[#fbfcfb] p-6"
              >
                <span className="font-jakarta text-3xl font-black text-[#187560]">{number}</span>
                <div>
                  <h3 className="font-jakarta text-base font-bold text-[#143c34]">{title}</h3>
                  <p className="mt-1.5 text-xs leading-6 text-[#5b756b]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book an Appointment Banner (like MediLife reference) */}
      <section className="bg-gradient-to-r from-[#104a3e] via-[#145c4d] to-[#1b725f] py-12 text-white sm:py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-5 sm:px-8 lg:flex-row lg:px-10">
          <div className="flex items-center gap-5">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-white backdrop-blur-md">
              <CalendarDays size={32} />
            </span>
            <div>
              <h2 className="font-jakarta text-2xl font-black tracking-tight sm:text-3xl">
                Rencanakan Kunjungan Kesehatan Anda Hari Ini
              </h2>
              <p className="mt-1 text-sm text-[#b8dfce] sm:text-base">
                Daftar secara online untuk memilih dokter dan jam praktik tanpa perlu menunggu lama.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="inline-flex min-h-[50px] shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-[#145c4d] shadow-lg transition hover:bg-[#edf6f1] hover:shadow-xl"
          >
            Buat Janji Sekarang <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-b border-[#dfe8e1] bg-[#f8faf8] py-16 lg:py-24" id="faq">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#187560]">
              Pusat Informasi
            </p>
            <h2 className="mt-3 font-jakarta text-3xl font-extrabold tracking-[-0.04em] text-[#143c34] sm:text-4xl">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="mt-10 divide-y divide-[#e3ece5] rounded-2xl border border-[#dbe6de] bg-white shadow-sm">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-jakarta text-base font-bold text-[#1a443b] marker:hidden">
                  {question}
                  <ChevronDown
                    size={20}
                    className="shrink-0 text-[#187560] transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#577469]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f2e27] text-[#c9ded5]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_0.8fr_0.9fr] lg:px-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 text-white">
              <span className="grid size-10 place-items-center rounded-xl bg-[#187560] text-white">
                <HeartPulse size={22} />
              </span>
              <span className="font-jakarta text-2xl font-black tracking-[-0.06em]">
                Klinik<span className="text-[#36b295]">Care</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#98b8ab]">
              Pelayanan rawat jalan terpadu, jadwal dokter spesialis yang akurat, dan instalasi
              farmasi siap layan demi kesehatan keluarga Anda.
            </p>
            <div className="mt-5 flex items-center gap-3 text-xs text-[#82a898]">
              <span>Demo Portofolio Healthcare System</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#71c0a8]">
              Navigasi Cepat
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              <a href="#layanan" className="transition hover:text-white">
                Layanan & Poli
              </a>
              <a href="#tentang" className="transition hover:text-white">
                Tentang Tim Medis
              </a>
              <a href="#dokter" className="transition hover:text-white">
                Jadwal & Profil Dokter
              </a>
              <a href="#kunjungan" className="transition hover:text-white">
                Alur Kunjungan Pasien
              </a>
              <a href="#faq" className="transition hover:text-white">
                Tanya Jawab (FAQ)
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#71c0a8]">
              Informasi Operasional
            </h3>
            <div className="mt-4 space-y-3.5 text-sm leading-6 text-[#9ebdb1]">
              <p className="flex gap-2.5">
                <Clock3 size={17} className="mt-1 shrink-0 text-[#4bc7a8]" />
                Senin – Jumat: 08.00 – 21.00 WIB
                <br />
                Sabtu: 08.00 – 14.00 WIB
              </p>
              <p className="flex gap-2.5">
                <MapPin size={17} className="mt-1 shrink-0 text-[#4bc7a8]" />
                Jl. Kesehatan Raya No. 12, Bandung, Jawa Barat
              </p>
              <p className="flex gap-2.5">
                <Phone size={17} className="mt-1 shrink-0 text-[#4bc7a8]" />
                (022) 8765-4321 / 0812-3456-7890
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-[#719687] sm:px-8 lg:px-10">
          © {new Date().getFullYear()} KlinikCare · Seluruh Hak Cipta Dilindungi · Sistem Informasi
          Klinik Terpadu
        </div>
      </footer>
    </main>
  );
}
