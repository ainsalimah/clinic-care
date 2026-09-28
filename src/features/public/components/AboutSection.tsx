import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarCheck, Clock3, MapPin, UserRoundCheck } from "lucide-react";

export function AboutSection() {
  return <section className="kc-about kc-section" id="tentang">
    <div className="kc-shell kc-about-grid">
      <div className="kc-about-image kc-reveal">
        <Image src="/images/clinic-hero.jpg" alt="Ruang pelayanan KlinikCare" fill sizes="(max-width: 900px) 92vw, 46vw" className="kc-cover" />
        <div className="kc-about-quote"><span>Skenario demo</span><p>Satu kunjungan mengalir dari meja pendaftaran sampai obat dan pembayaran selesai.</p></div>
      </div>
      <div className="kc-about-copy kc-reveal">
        <p className="kc-eyebrow">Tentang simulasi</p>
        <h2 className="kc-heading">Detail yang cukup lengkap untuk menguji alur klinik sungguhan.</h2>
        <p className="kc-body-large">KlinikCare menyatukan pendaftaran, antrean, rekam medis, resep, stok, pembayaran, dan laporan. Seluruh nama serta transaksi pada demo dibuat sebagai data contoh.</p>
        <div className="kc-info-row"><Clock3 size={18} /><div><b>Jam operasional simulasi</b><span>Senin–Jumat 08.00–21.00 · Sabtu 08.00–14.00</span></div></div>
        <div className="kc-info-row"><MapPin size={18} /><div><b>Lokasi contoh</b><span>Jl. Kesehatan Raya No. 12, Bandung</span></div></div>
        <div className="kc-choice-grid">
          <article className="kc-choice-card kc-card-motion"><CalendarCheck size={21} /><small>Terencana</small><h3>Daftar online</h3><p>Pilih dokter dan jadwal, lalu lihat pengajuan dari dashboard resepsionis.</p><Link href="/register">Coba mendaftar <ArrowRight size={14} /></Link></article>
          <article className="kc-choice-card kc-card-motion"><UserRoundCheck size={21} /><small>Operasional</small><h3>Datang langsung</h3><p>Uji pendaftaran walk-in dan pelayanan pasien lansia tanpa ponsel.</p><a href="#alur">Lihat alur lengkap <ArrowRight size={14} /></a></article>
        </div>
      </div>
    </div>
  </section>;
}
