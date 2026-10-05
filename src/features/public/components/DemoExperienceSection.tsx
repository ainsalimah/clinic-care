"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Stethoscope, UserCheck, Users, Pill } from "lucide-react";

const roles = [
  {
    id: "receptionist",
    title: "Resepsionis",
    desc: "Admisi Pasien & Antrean Audio",
    icon: Users,
    badge: "Pintu Depan",
    href: "/login#demo",
    summary: "Check-in pasien mandiri/walk-in, cetak nomor antrean, dan panggil suara otomatis multi-poli.",
    bullets: [
      "Check-in janji temu & terbitkan nomor tiket poli",
      "Panggilan audio otomatis ke speaker ruang tunggu",
      "Pendaftaran cepat pasien walk-in & lansia",
    ],
  },
  {
    id: "doctor",
    title: "Dokter",
    desc: "SOAP & E-Prescription",
    icon: Stethoscope,
    badge: "Klinis",
    href: "/login#demo",
    summary: "Akses rekam medis terpadu, input diagnosa SOAP terstandar, dan kirim resep digital langsung ke farmasi.",
    bullets: [
      "Pemeriksaan riwayat medis & alergi pasien",
      "Pencatatan Subjective, Objective, Assessment, Plan",
      "Resep obat digital langsung terhubung ke kasir",
    ],
  },
  {
    id: "pharmacist",
    title: "Apoteker",
    desc: "Dispensing & Billing",
    icon: Pill,
    badge: "Instalasi Farmasi",
    href: "/login#demo",
    summary: "Terima resep seketika, cek ketersediaan stok, racik obat, dan cetak etiket aturan pakai tanpa resep manual.",
    bullets: [
      "Antrean resep real-time langsung dari ruang periksa",
      "Pengurangan stok obat otomatis saat dispensasi",
      "Kuitansi pembayaran kasir obat terintegrasi",
    ],
  },
  {
    id: "patient",
    title: "Pasien",
    desc: "Portal Mandiri",
    icon: UserCheck,
    badge: "Pasien",
    href: "/login#demo",
    summary: "Reservasi jadwal dokter online, pantau status nomor antrean langsung dari smartphone, dan cek riwayat kontrol.",
    bullets: [
      "Pendaftaran janji temu dokter 24/7",
      "Pantau antrean dari ponsel secara transparan",
      "Histori catatan rekam medis & resep pribadi",
    ],
  },
];

export function DemoExperienceSection() {
  const [activeTab, setActiveTab] = useState(0);
  const current = roles[activeTab];
  const Icon = current.icon;

  return (
    <section id="demo" className="pad mesh" aria-label="Simulasi peran sistem klinik">
      <div className="wrap">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow text-[#2F80C0] mb-2 flex items-center justify-center gap-1.5 font-bold">
            <Sparkles size={14} />
            <span>MODE SIMULASI PRODUK</span>
          </p>
          <h2 className="text-[#0B2D45] font-extrabold text-2xl sm:text-3xl">
            Coba Alur 4 Peran Secara Langsung
          </h2>
          <p className="mt-3 text-[#315066] text-base leading-relaxed">
            KlinikCare dirancang dengan alur nyata yang menghubungkan loket resepsionis, ruang periksa dokter, instalasi farmasi, dan portal pasien dalam satu sistem.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {roles.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={"demo-role-tab " + (activeTab === i ? "active" : "")}
              onClick={() => setActiveTab(i)}
            >
              {r.title}
            </button>
          ))}
        </div>

        {/* Active Role Card */}
        <div className="mt-8 bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-[#d5e2eb] max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8EEF2]">
            <div className="flex items-center gap-4">
              <span className="w-12 h-12 rounded-2xl bg-[#0B2D45] text-white flex items-center justify-center shrink-0">
                <Icon size={24} />
              </span>
              <div>
                <h3 className="font-bold text-xl text-[#0B2D45]">{current.title}</h3>
                <p className="text-sm text-[#256da5] font-semibold">{current.desc}</p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E8EEF2] text-[#0B2D45]">
              {current.badge}
            </span>
          </div>

          <p className="mt-6 text-[#315066] text-base leading-relaxed">
            {current.summary}
          </p>

          <ul className="mt-6 space-y-3">
            {current.bullets.map((b, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#2F80C0] shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-[#0B2D45] font-medium">{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-[#E8EEF2] flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#4c6475]">
              <ShieldCheck size={16} className="text-[#2F80C0]" />
              <span>Simulasi aman: Data uji terisolasi tanpa risiko</span>
            </div>
            <Link
              href={current.href}
              className="btn !py-2.5 !px-5 text-sm sm:text-base font-bold text-white flex items-center gap-2"
            >
              <span>Masuk Mode {current.title}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
