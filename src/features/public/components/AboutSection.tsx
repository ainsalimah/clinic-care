import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  MapPin,
  Sparkles,
} from "lucide-react";

export function AboutSection() {
  const pillars = [
    {
      title: "Rekam Medis SOAP Terpadu",
      desc: "Anamnesis fisik, tanda vital, dan diagnosa ICD-10 tersimpan seumur hidup pasien.",
    },
    {
      title: "Antrean Suara Multi-Ruang",
      desc: "Speaker otomatis memanggil nomor antrean langsung ke pintu ruang praktik dokter.",
    },
    {
      title: "Resep Digital & Kasir Farmasi",
      desc: "Resep seketika masuk ke instalasi farmasi. Stok terpotong aman dan tagihan digabung.",
    },
    {
      title: "Layanan Inklusif Prioritas",
      desc: "Meja resepsionis siap mendampingi pasien lansia dan darurat secara manual.",
    },
  ];

  return (
    <section className="kc-about-section" id="tentang">
      <div className="kc-shell">
        <div className="kc-about-grid">
          {/* Left Column: Visual Showcase */}
          <div className="kc-about-visual-col kc-reveal">
            <div className="kc-about-frame">
              <div className="kc-about-img-wrap">
                <Image
                  src="/images/clinic_digital_ecosystem.jpg"
                  alt="Visualisasi Ekosistem Digital Terpadu KlinikCare"
                  fill
                  sizes="(max-width: 960px) 100vw, 540px"
                  className="kc-about-img"
                />
              </div>

              {/* Float Badge */}
              <div className="kc-about-float-badge">
                <div className="kc-float-icon-teal">
                  <Sparkles size={18} />
                </div>
                <div>
                  <b>Arsitektur Data Terpusat</b>
                  <p>Rekam medis SOAP, resep, antrean & farmasi sinkron otomatis</p>
                </div>
              </div>
            </div>

            {/* Quick Operational Info Bar */}
            <div className="kc-about-oper-bar">
              <div className="kc-oper-item">
                <Clock3 size={18} className="text-emerald-700" />
                <div>
                  <b>Jam Pelayanan Klinik</b>
                  <span>Senin–Jumat 08.00–21.00 WIB · Sabtu 08.00–14.00 WIB</span>
                </div>
              </div>
              <div className="kc-oper-item">
                <MapPin size={18} className="text-emerald-700" />
                <div>
                  <b>Fasilitas Kesehatan</b>
                  <span>Jl. Kesehatan Raya No. 12, Bandung (Data Simulasi)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Clinical Guarantees */}
          <div className="kc-about-copy-col kc-reveal">
            <p className="kc-eyebrow">
              <Sparkles size={13} />
              <span>Standar Operasional Klinik</span>
            </p>
            <h2 className="kc-heading">
              Kenyamanan pasien,<br />
              <em>kepastian alur bagi dokter & apoteker.</em>
            </h2>
            <p className="kc-lead-p">
              KlinikCare mengintegrasikan seluruh titik sentuh rawat jalan: dari saat pasien mendaftar di rumah
              atau datang langsung, check-in di resepsionis, konsultasi medis SOAP, hingga pengambilan obat di
              instalasi farmasi.
            </p>

            {/* Clinical Value Pillars */}
            <div className="kc-about-pillars">
              {pillars.map((item) => (
                <div key={item.title} className="kc-pillar-card">
                  <div className="kc-pillar-head">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    <b>{item.title}</b>
                  </div>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Dual Patient Options */}
            <div className="kc-choices-grid">
              <article className="kc-choice-card">
                <div className="kc-choice-top">
                  <div className="kc-choice-icon">
                    <CalendarCheck size={20} />
                  </div>
                  <small>Pasien Terencana</small>
                </div>
                <h3>Daftar Janji Temu Online</h3>
                <p>Pilih poli, dokter, dan jam periksa dari rumah. Kuota terjadwal dengan pasti.</p>
                <Link href="/register" className="kc-btn-secondary kc-choice-btn">
                  <span>Mulai Daftar Online</span>
                  <ArrowRight size={14} />
                </Link>
              </article>

              <article className="kc-choice-card">
                <div className="kc-choice-top">
                  <div className="kc-choice-icon kc-choice-icon-gold">
                    <HeartHandshake size={20} />
                  </div>
                  <small>Inklusif & Ramah Lansia</small>
                </div>
                <h3>Pelayanan Datang Langsung</h3>
                <p>Pasien lansia atau darurat tetap dilayani cepat oleh resepsionis tanpa wajib smartphone.</p>
                <a href="#alur" className="kc-btn-secondary kc-choice-btn">
                  <span>Lihat Alur Kedatangan</span>
                  <ArrowRight size={14} />
                </a>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
