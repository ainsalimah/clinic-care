import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Check } from "lucide-react";

export function HeroSection({ doctorCount }: { doctorCount: number }) {
  return <section className="kc-hero">
    <Image src="/images/hero-medical-team.jpg" alt="Tim dokter dan tenaga kesehatan KlinikCare" fill priority sizes="100vw" className="kc-hero-background" />
    <div className="kc-hero-background-shade" aria-hidden="true" />
    <div className="kc-hero-orb kc-hero-orb-one" />
    <div className="kc-hero-orb kc-hero-orb-two" />
    <div className="kc-shell kc-hero-grid">
      <div className="kc-hero-copy">
        <p className="kc-kicker kc-hero-motion"><span /> Kesehatan keluarga, tertata dengan baik</p>
        <h1 className="kc-display kc-hero-motion">Perawatan yang terasa <em>lebih personal.</em></h1>
        <p className="kc-hero-lead kc-hero-motion">Dari memilih dokter sampai menerima obat, setiap langkah dibuat jelas, tenang, dan terhubung dalam satu pengalaman klinik.</p>
        <div className="kc-hero-actions kc-hero-motion">
          <Link href="/register" className="kc-button">Buat janji kunjungan <ArrowRight size={17} /></Link>
          <a href="#dokter" className="kc-button-secondary"><CalendarDays size={17} /> Lihat jadwal dokter</a>
        </div>
        <div className="kc-trust-list kc-hero-motion">
          <span><Check size={15} /> Dokter ber-SIP</span>
          <span><Check size={15} /> Rekam medis terpadu</span>
          <span><Check size={15} /> Ramah pasien lansia</span>
        </div>
      </div>
    </div>
    <div className="kc-shell kc-proof kc-hero-motion">
      <p>Pelayanan klinik dalam satu alur</p>
      <div><b>4 Poli</b><span>Konsultasi terarah</span></div>
      <div><b>{doctorCount} Dokter</b><span>Umum & spesialis</span></div>
      <div><b>1 Sistem</b><span>Dari daftar hingga obat</span></div>
    </div>
  </section>;
}
