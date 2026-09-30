"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  Clock,
  HeartPulse,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Volume2,
} from "lucide-react";

export function HeroSection({
  doctorCount,
  departmentCount,
}: {
  doctorCount: number;
  departmentCount: number;
}) {
  const [selectedQuickDept, setSelectedQuickDept] = useState("all");

  const quickDepts = [
    { id: "all", label: "Semua Poli" },
    { id: "umum", label: "Poli Umum" },
    { id: "anak", label: "Poli Anak" },
    { id: "gigi", label: "Poli Gigi" },
    { id: "dalam", label: "Penyakit Dalam" },
  ];

  return (
    <section className="kc-hero">
      {/* Soft Ambient Medical Aura */}
      <div className="kc-hero-ambient" aria-hidden="true">
        <div className="kc-ambient-blob kc-blob-1" />
        <div className="kc-ambient-blob kc-blob-2" />
        <div className="kc-ambient-blob kc-blob-3" />
      </div>

      <div className="kc-shell kc-hero-grid">
        <div className="kc-hero-copy">
          {/* Eyebrow Kicker */}
          <div className="kc-hero-kicker kc-hero-motion">
            <span className="kc-kicker-dot" />
            <Sparkles size={14} className="kc-kicker-icon" />
            <span>Sistem Operasional Klinik & Farmasi Terpadu</span>
          </div>

          {/* Main Headline */}
          <h1 className="kc-hero-display kc-hero-motion">
            Pelayanan medis modern,<br />
            <em>terhubung dari pendaftaran hingga obat.</em>
          </h1>

          {/* Value proposition lead */}
          <p className="kc-hero-lead kc-hero-motion">
            Solusi klinik rawat jalan terintegrasi: pendaftaran online mandiri, pemanggilan antrean audio
            multi-ruang otomatis, rekam medis SOAP terstandar, hingga resep digital dan kasir farmasi yang
            tersinkronisasi secara real-time tanpa antre berulang.
          </p>

          {/* Quick Action Buttons */}
          <div className="kc-hero-actions kc-hero-motion">
            <Link href="/register" className="kc-btn-primary">
              <CalendarCheck size={18} />
              <span>Daftar Janji Temu Online</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/login#demo" className="kc-btn-secondary">
              <Sparkles size={17} className="text-emerald-700" />
              <span>Jelajahi Demo 4 Role</span>
            </Link>
          </div>

          {/* Quick Polyclinic Jump Bar */}
          <div className="kc-hero-quicksearch kc-hero-motion">
            <div className="kc-quicksearch-label">
              <Search size={14} />
              <span>Pilih Layanan Cepat:</span>
            </div>
            <div className="kc-quicksearch-pills">
              {quickDepts.map((d) => (
                <a
                  key={d.id}
                  href="#dokter"
                  className={`kc-quick-pill ${
                    selectedQuickDept === d.id ? "kc-quick-pill-active" : ""
                  }`}
                  onClick={() => setSelectedQuickDept(d.id)}
                >
                  {d.label}
                </a>
              ))}
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="kc-hero-trust kc-hero-motion">
            <div className="kc-trust-pill">
              <Check size={14} className="kc-trust-check" />
              <span>Dokter Ber-SIP Resmi</span>
            </div>
            <div className="kc-trust-pill">
              <Check size={14} className="kc-trust-check" />
              <span>Panggilan Suara Real-time</span>
            </div>
            <div className="kc-trust-pill">
              <Check size={14} className="kc-trust-check" />
              <span>E-Resep Langsung ke Farmasi</span>
            </div>
            <div className="kc-trust-pill">
              <Check size={14} className="kc-trust-check" />
              <span>Pendampingan Lansia</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Visual Showcase */}
        <div className="kc-hero-visual kc-hero-motion">
          <div className="kc-visual-frame">
            <div className="kc-visual-img-box">
              <Image
                src="/images/hero_clinic_modern.jpg"
                alt="Fasilitas Pelayanan Modern KlinikCare"
                fill
                priority
                sizes="(max-width: 960px) 100vw, 560px"
                className="kc-hero-img"
              />
              <div className="kc-visual-shade" />

              {/* Status Overlay Badge */}
              <div className="kc-hero-img-badge">
                <span className="kc-pulse-dot" />
                <span>Pelayanan Poliklinik Berjalan Normal</span>
              </div>
            </div>

            {/* Float Card 1: Queue Calling Simulator */}
            <div className="kc-float-card kc-float-card-top">
              <div className="kc-float-icon kc-float-icon-teal">
                <Volume2 size={20} />
              </div>
              <div className="kc-float-body">
                <div className="kc-float-title">
                  <span className="kc-pulse-dot" />
                  <b>Panggilan Antrean · A-014</b>
                  <span className="kc-mini-tag">Audio TTS</span>
                </div>
                <small className="kc-float-sub">Sari Wulandari · Menuju Poli Umum (R. 101)</small>
                <div className="kc-soundwaves" aria-hidden="true">
                  <span className="kc-bar kc-bar-1" />
                  <span className="kc-bar kc-bar-2" />
                  <span className="kc-bar kc-bar-3" />
                  <span className="kc-bar kc-bar-4" />
                </div>
              </div>
            </div>

            {/* Float Card 2: SOAP Examination Card */}
            <div className="kc-float-card kc-float-card-middle">
              <div className="kc-float-icon kc-float-icon-blue">
                <Stethoscope size={18} />
              </div>
              <div className="kc-float-body">
                <div className="kc-float-title">
                  <b>Pemeriksaan SOAP Aktif</b>
                  <BadgeCheck size={15} className="text-emerald-600" />
                </div>
                <small className="kc-float-sub">dr. Hendra Pratama · Diagnosa ICD-10 terhubung</small>
              </div>
            </div>

            {/* Float Card 3: Digital Prescription & Pharmacy Card */}
            <div className="kc-float-card kc-float-card-bottom">
              <div className="kc-float-icon kc-float-icon-gold">
                <Pill size={20} />
              </div>
              <div className="kc-float-body">
                <div className="kc-float-title">
                  <b>E-Resep & Farmasi Otomatis</b>
                  <span className="kc-mini-tag-gold">Instan</span>
                </div>
                <small className="kc-float-sub">Stok terpotong aman · Etiket dosis tercetak</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proof Metric Bar */}
      <div className="kc-shell kc-hero-proof-shell">
        <div className="kc-hero-proof-bar kc-hero-motion">
          <div className="kc-proof-item">
            <div className="kc-proof-header">
              <HeartPulse size={20} className="kc-proof-icon" />
              <b>{departmentCount || 4} Poli Aktif</b>
            </div>
            <span>Umum, Anak, Gigi, & Penyakit Dalam</span>
          </div>
          <div className="kc-proof-sep" />

          <div className="kc-proof-item">
            <div className="kc-proof-header">
              <Stethoscope size={20} className="kc-proof-icon" />
              <b>{doctorCount || 5} Dokter Praktik</b>
            </div>
            <span>Spesialis & dokter umum ber-SIP resmi</span>
          </div>
          <div className="kc-proof-sep" />

          <div className="kc-proof-item">
            <div className="kc-proof-header">
              <Clock size={20} className="kc-proof-icon" />
              <b>Senin–Sabtu</b>
            </div>
            <span>Buka pagi s.d. malam (08.00–21.00 WIB)</span>
          </div>
          <div className="kc-proof-sep" />

          <div className="kc-proof-item">
            <div className="kc-proof-header">
              <ShieldCheck size={20} className="kc-proof-icon" />
              <b>1 Database Sinkron</b>
            </div>
            <span>Dari pendaftaran sampai obat selesai</span>
          </div>
        </div>
      </div>
    </section>
  );
}
