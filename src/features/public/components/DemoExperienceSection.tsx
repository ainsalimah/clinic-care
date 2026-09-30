"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCheck,
  UserRound,
} from "lucide-react";

interface RoleData {
  id: "PATIENT" | "RECEPTIONIST" | "DOCTOR" | "PHARMACIST";
  stepNumber: string;
  role: string;
  name: string;
  tag: string;
  badgeColor: string;
  icon: typeof UserCheck;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  mockup: {
    heading: string;
    subheading: string;
    statusPill: string;
    items: { label: string; value: string; badge?: string; badgeType?: "success" | "warning" | "info" }[];
    actionText: string;
  };
}

const roleList: RoleData[] = [
  {
    id: "PATIENT",
    stepNumber: "01",
    role: "Pasien",
    name: "Sari Wulandari",
    tag: "Portal Mandiri Pasien",
    badgeColor: "emerald",
    icon: UserRound,
    title: "Reservasi Online & Pantau Kuota Kunjungan",
    tagline: "Pilih tanggal, cek sisa kuota dokter per hari, dan terima konfirmasi jadwal tanpa antre fisik.",
    description:
      "Portal ramah pengguna untuk pasien memilih tanggal periksa, melihat profil dokter, memeriksa sisa slot per hari, dan meninjau riwayat kunjungan medis secara mandiri dari smartphone atau komputer rumah.",
    features: [
      "Jadwal dokter real-time dengan sisa kuota per sesi",
      "Pengajuan janji temu online tanpa antre pagi",
      "Nomor rekam medis digital tersimpan rapi",
      "Pantauan riwayat kunjungan dan status resep obat",
    ],
    mockup: {
      heading: "Portal Kunjungan Saya",
      subheading: "Sari Wulandari · No. RM: 2026-0001",
      statusPill: "Jadwal Terkonfirmasi",
      items: [
        { label: "Poli Pilihan", value: "Poli Umum · dr. Hendra Pratama" },
        { label: "Jadwal & Kuota", value: "Hari Ini · 08.00 - 12.00 WIB", badge: "Sisa 8 Slot", badgeType: "info" },
        { label: "Status Kedatangan", value: "Silakan check-in di resepsionis", badge: "Terkonfirmasi", badgeType: "success" },
      ],
      actionText: "Tampilkan Kode Booking Kunjungan",
    },
  },
  {
    id: "RECEPTIONIST",
    stepNumber: "02",
    role: "Resepsionis",
    name: "Dita Prameswari",
    tag: "Meja Penerimaan & Antrean",
    badgeColor: "teal",
    icon: UserCheck,
    title: "Check-in Pasien & Panggilan Antrean Bersuara",
    tagline: "Verifikasi pasien, terbitkan nomor antrean resmi, dan panggil nomor ke ruang dokter.",
    description:
      "Meja depan melayani pasien terjadwal maupun walk-in, menerbitkan nomor antrean per poli, serta memanggil antrean dengan output audio text-to-speech otomatis menuju nomor ruangan praktik dokter bertugas.",
    features: [
      "Pencarian cepat pasien via NIK atau No. RM",
      "Check-in kedatangan & terbitkan nomor antrean",
      "Pemanggilan audio otomatis ke speaker ruang dokter",
      "Pendampingan pendaftaran manual pasien lansia",
    ],
    mockup: {
      heading: "Daftar Antrean Hari Ini",
      subheading: "Poli Umum · dr. Hendra Pratama",
      statusPill: "Audio Pemanggil Aktif",
      items: [
        { label: "Antrean A-012", value: "Budi Santoso · Selesai diperiksa", badge: "Selesai", badgeType: "info" },
        { label: "Antrean A-013", value: "Dewi Lestari · Di ruang dokter", badge: "Diperiksa", badgeType: "warning" },
        { label: "Antrean A-014", value: "Sari Wulandari · Menunggu panggilan", badge: "Berikutnya", badgeType: "success" },
      ],
      actionText: "Panggil Nomor Antrean A-014 ke Ruang 101",
    },
  },
  {
    id: "DOCTOR",
    stepNumber: "03",
    role: "Dokter",
    name: "dr. Hendra Pratama",
    tag: "Ruang Konsultasi & SOAP",
    badgeColor: "cyan",
    icon: Stethoscope,
    title: "Pemeriksaan Medis SOAP & Resep Elektronik",
    tagline: "Panggil pasien ke ruangan, catat anamnesis SOAP, tentukan diagnosa, dan terbitkan resep digital.",
    description:
      "Workspace klinis terfokus untuk meninjau riwayat medis terdahulu, mencatat hasil pemeriksaan fisik terstruktur (Subjektif, Objektif, Asesmen, Plan), dan mengirim resep langsung ke bagian instalasi farmasi.",
    features: [
      "Akses riwayat kunjungan dan riwayat alergi pasien",
      "Pencatatan SOAP (Subjektif, Objektif, Asesmen, Plan)",
      "Penerbitan e-Resep terhubung langsung ke stok apotek",
      "Terintegrasi dengan sistem speaker pemanggil antrean",
    ],
    mockup: {
      heading: "Pemeriksaan Aktif: Sari Wulandari",
      subheading: "No. RM: 2026-0001 · 29 Tahun · R. 101",
      statusPill: "Konsultasi Berjalan",
      items: [
        { label: "Anamnesis (S)", value: "Demam 3 hari, flu, batuk berdahak", badge: "Subjektif", badgeType: "info" },
        { label: "Tanda Vital (O)", value: "TD: 120/80 mmHg · Nadi: 78 · Suhu: 38.2°C", badge: "Objektif", badgeType: "info" },
        { label: "Diagnosa (A)", value: "J06.9 - Infeksi Saluran Napas Akut", badge: "Asesmen", badgeType: "success" },
      ],
      actionText: "Simpan SOAP & Terbitkan E-Resep ke Farmasi",
    },
  },
  {
    id: "PHARMACIST",
    stepNumber: "04",
    role: "Apoteker",
    name: "Apt. Budi Santoso",
    tag: "Instalasi Farmasi & Kasir",
    badgeColor: "amber",
    icon: Pill,
    title: "Peracikan Obat, Stok Aman & Kasir Terpadu",
    tagline: "Terima resep seketika dari dokter, siapkan obat, potong stok aman, dan satukan tagihan.",
    description:
      "Bagian farmasi terhubung seketika saat dokter menyelesaikan konsultasi. Stok obat terpotong secara transaksional, etiket dosis dicetak, dan pembayaran diproses tanpa double entry antara jasa dokter dan obat.",
    features: [
      "Daftar tunggu resep masuk secara real-time",
      "Pemotongan kuota stok obat otomatis aman",
      "Pencetakan etiket aturan dosis pemakaian",
      "Kasir gabungan jasa konsultasi dan obat",
    ],
    mockup: {
      heading: "Resep #RX-202609-088",
      subheading: "Pasien: Sari Wulandari · dr. Hendra",
      statusPill: "Resep Masuk",
      items: [
        { label: "Paracetamol 500mg", value: "10 tablet · 3x1 sesudah makan", badge: "Stok Terpotong", badgeType: "info" },
        { label: "Amoxicillin 500mg", value: "10 kapsul · 3x1 habiskan", badge: "Etiket Siap", badgeType: "info" },
        { label: "Total Pembayaran", value: "Rp 128.000 (Konsultasi + 2 Obat)", badge: "Siap Bayar", badgeType: "success" },
      ],
      actionText: "Serahkan Obat & Cetak Bukti Pembayaran",
    },
  },
];

export function DemoExperienceSection() {
  const [activeId, setActiveId] = useState<"PATIENT" | "RECEPTIONIST" | "DOCTOR" | "PHARMACIST">("PATIENT");
  const activeRole = roleList.find((r) => r.id === activeId) || roleList[0];
  const IconComp = activeRole.icon;

  return (
    <section className="kc-demo-section" id="demo">
      <div className="kc-shell">
        {/* Section Heading */}
        <div className="kc-demo-intro kc-reveal">
          <div>
            <p className="kc-eyebrow">
              <Sparkles size={13} />
              <span>Simulasi Produk Interaktif</span>
            </p>
            <h2 className="kc-heading">
              Empat sudut pandang.<br />
              <em>Satu alur yang utuh dan saling terhubung.</em>
            </h2>
          </div>
          <p className="kc-demo-desc">
            Seluruh data pasien, antrean, resep, dan tagihan tersinkronisasi pada database terpadu. Perubahan
            status di satu bagian langsung tercermin seketika pada peran berikutnya.
          </p>
        </div>

        {/* Clinical Progression Pipeline */}
        <div className="kc-pipeline-strip kc-reveal">
          <div className="kc-pipeline-label">
            <Activity size={14} />
            <span>Alur Pelayanan Sekuensial:</span>
          </div>
          <div className="kc-pipeline-steps">
            {roleList.map((item, index) => {
              const isSelected = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`kc-pipeline-step ${isSelected ? "kc-pipeline-step-active" : ""}`}
                  onClick={() => setActiveId(item.id)}
                >
                  <span className="kc-step-bubble">{item.stepNumber}</span>
                  <div className="kc-step-info">
                    <b>{item.role}</b>
                    <small>{item.tag.split("&")[0]}</small>
                  </div>
                  {index < roleList.length - 1 && <ChevronRight size={14} className="kc-step-arr" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="kc-role-tabs kc-reveal">
          {roleList.map((item) => {
            const ItemIcon = item.icon;
            const isSelected = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`kc-role-tab ${isSelected ? "kc-role-tab-active" : ""}`}
                onClick={() => setActiveId(item.id)}
              >
                <div className={`kc-role-tab-icon kc-icon-${item.badgeColor}`}>
                  <ItemIcon size={20} />
                </div>
                <div className="kc-role-tab-text">
                  <span className="kc-tab-num">Langkah {item.stepNumber}</span>
                  <b>{item.role}</b>
                  <small>{item.name}</small>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Role Showcase Card */}
        <div className="kc-role-card kc-reveal">
          <div className="kc-role-card-grid">
            {/* Left Column: Role Details */}
            <div className="kc-role-card-left">
              <div className="kc-role-badge-row">
                <span className="kc-role-tag">
                  <IconComp size={15} />
                  <span>{activeRole.tag}</span>
                </span>
                <span className="kc-role-sim-account">
                  Akun Demo Siap Pakai: <b>{activeRole.name}</b>
                </span>
              </div>

              <h3 className="kc-role-card-title">{activeRole.title}</h3>
              <p className="kc-role-card-tagline">{activeRole.tagline}</p>
              <p className="kc-role-card-desc">{activeRole.description}</p>

              <div className="kc-role-feature-list">
                {activeRole.features.map((feat) => (
                  <div key={feat} className="kc-role-feature-item">
                    <span className="kc-role-check">
                      <Check size={14} strokeWidth={2.5} />
                    </span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="kc-role-card-actions">
                <Link href="/login#demo" className="kc-btn-primary">
                  <span>Masuk Sebagai {activeRole.role}</span>
                  <ArrowRight size={16} />
                </Link>
                <div className="kc-demo-pill-hint">
                  <ShieldCheck size={15} />
                  <span>1-klik langsung masuk tanpa ketik password</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Clinical Console Mockup */}
            <div className="kc-role-card-right">
              <div className="kc-mock-console">
                {/* Console Bar */}
                <div className="kc-mock-top">
                  <div className="kc-mock-dots">
                    <span className="kc-dot-red" />
                    <span className="kc-dot-yellow" />
                    <span className="kc-dot-green" />
                  </div>
                  <div className="kc-mock-live-pill">
                    <span className="kc-pulse-dot" />
                    <span>{activeRole.mockup.statusPill}</span>
                  </div>
                </div>

                {/* Console Body */}
                <div className="kc-mock-body">
                  <div className="kc-mock-head">
                    <div className="kc-mock-header-row">
                      <h4>{activeRole.mockup.heading}</h4>
                      <span className="kc-console-role-tag">{activeRole.role}</span>
                    </div>
                    <p>{activeRole.mockup.subheading}</p>
                  </div>

                  <div className="kc-mock-rows">
                    {activeRole.mockup.items.map((it, idx) => (
                      <div key={idx} className="kc-mock-row">
                        <div className="kc-mock-row-left">
                          <span className="kc-mock-key">{it.label}</span>
                          <span className="kc-mock-val">{it.value}</span>
                        </div>
                        {it.badge && (
                          <span
                            className={`kc-mock-tag ${
                              it.badgeType === "success"
                                ? "kc-mock-tag-success"
                                : it.badgeType === "warning"
                                ? "kc-mock-tag-warning"
                                : "kc-mock-tag-info"
                            }`}
                          >
                            {it.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="kc-mock-action">
                    <div className="kc-mock-action-btn">
                      <span>{activeRole.mockup.actionText}</span>
                      <ArrowUpRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Disclaimer / Reassurance Note */}
        <div className="kc-demo-note kc-reveal">
          <span className="kc-note-pill">DATA SIMULASI TERVERIFIKASI</span>
          <p>
            Nama pasien, alamat, nomor rekam medis, keluhan fisik, dan transaksi resep pada portal ini
            adalah data simulasi non-sensitif yang dirancang khusus untuk menguji kenyamanan alur klinik tanpa risiko privasi.
          </p>
          <Link href="/login#demo" className="kc-note-link">
            <span>Buka Ruang Demo Sekarang</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
