import Image from "next/image";
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { facilities } from "../content";

export function HospitalFacilitiesSection() {
  return (
    <section className="kc-facilities-section kc-section" id="fasilitas">
      <div className="kc-shell">
        <div className="kc-section-head kc-reveal">
          <div>
            <p className="kc-eyebrow">
              <Sparkles size={13} />
              <span>Fasilitas & Infrastruktur Medis</span>
            </p>
            <h2 className="kc-heading">
              Standar fasilitas prima,<br />
              <em>dirancang higienis, privat, dan terintegrasi.</em>
            </h2>
          </div>
          <p className="kc-section-head-desc">
            Seluruh ruang periksa, ruang tunggu, dan instalasi farmasi kami memenuhi standar sanitasi
            dan ergonomi medis untuk memastikan kenyamanan pasien dan ketepatan diagnosis dokter.
          </p>
        </div>

        {/* Asymmetric Facilities Layout */}
        <div className="kc-facilities-grid">
          {facilities.map((facility, index) => (
            <article
              key={facility.id}
              className={`kc-facility-card kc-reveal ${
                index === 0 ? "kc-facility-card-primary" : ""
              }`}
            >
              <div className="kc-facility-img-wrap">
                <Image
                  src={facility.image}
                  alt={facility.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="kc-facility-img"
                />
                <div className="kc-facility-overlay" />
                <span className="kc-facility-tag">{facility.tag}</span>
              </div>

              <div className="kc-facility-content">
                <div className="kc-facility-meta">
                  <span className="kc-facility-num">0{index + 1}</span>
                  <span className="kc-facility-badge">
                    <ShieldCheck size={13} />
                    <span>Terakreditasi</span>
                  </span>
                </div>

                <h3 className="kc-facility-title">{facility.title}</h3>
                <h4 className="kc-facility-subtitle">{facility.subtitle}</h4>
                <p className="kc-facility-desc">{facility.description}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Hygiene and Safety Guarantee Bar */}
        <div className="kc-hygiene-bar kc-reveal">
          <div className="kc-hygiene-item">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <div>
              <b>Sterilisasi Berkala</b>
              <span>Pembersihan disinfektan medis setiap pergantian shift periksa</span>
            </div>
          </div>
          <div className="kc-hygiene-sep" />
          <div className="kc-hygiene-item">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <div>
              <b>Sistem Sirkulasi Udara HEPA</b>
              <span>Filter udara medis untuk mencegah transmisi aerosol poliklinik</span>
            </div>
          </div>
          <div className="kc-hygiene-sep" />
          <div className="kc-hygiene-item">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <div>
              <b>Akses Kursi Roda Siaga</b>
              <span>Fasilitas pendukung difabel dan lansia di lobi utama klinik</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
