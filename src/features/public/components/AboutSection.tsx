import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarCheck, Clock3, MapPin, UserRoundCheck } from "lucide-react";

export function AboutSection() {
  return <section className="kc-about kc-section" id="tentang">
    <div className="kc-shell kc-about-grid">
      <div className="kc-about-image kc-reveal">
        <Image src="/images/clinic-hero.jpg" alt="Ruang pelayanan KlinikCare yang nyaman" fill sizes="(max-width: 900px) 92vw, 46vw" className="kc-cover" />
        <div className="kc-about-quote"><span>Prinsip kami</span><p>Pelayanan medis yang baik dimulai dari rasa aman dan informasi yang jelas.</p></div>
      </div>
      <div className="kc-about-copy kc-reveal">
        <p className="kc-eyebrow">Cara kami merawat</p>
        <h2 className="kc-heading">Profesional dalam tindakan, hangat dalam pelayanan.</h2>
        <p className="kc-body-large">KlinikCare menyatukan konsultasi, rekam medis, resep, dan farmasi dalam satu alur. Pasien tidak perlu berpindah sistem atau menebak tahap berikutnya.</p>
        <div className="kc-info-row"><Clock3 size={18} /><div><b>Jam pelayanan panjang</b><span>Senin—Jumat 08.00—21.00 · Sabtu 08.00—14.00</span></div></div>
        <div className="kc-info-row"><MapPin size={18} /><div><b>Mudah dijangkau</b><span>Jl. Kesehatan Raya No. 12, Bandung</span></div></div>
        <div className="kc-choice-grid">
          <article className="kc-choice-card kc-card-motion"><CalendarCheck size={21} /><small>Terencana</small><h3>Daftar online</h3><p>Pilih dokter dan jadwal dari rumah, lalu check-in saat tiba.</p><Link href="/register">Mulai daftar <ArrowRight size={14} /></Link></article>
          <article className="kc-choice-card kc-card-motion"><UserRoundCheck size={21} /><small>Fleksibel</small><h3>Datang langsung</h3><p>Petugas membantu pendaftaran, termasuk pasien lansia tanpa ponsel.</p><a href="#alur">Lihat alurnya <ArrowRight size={14} /></a></article>
        </div>
      </div>
    </div>
  </section>;
}
