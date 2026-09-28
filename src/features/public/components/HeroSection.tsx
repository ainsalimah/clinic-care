import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, CircleCheck, Sparkles } from "lucide-react";

const liveFlow = [
  ["08.10", "Pasien check-in", "Resepsionis"],
  ["08.14", "Nomor antrean dipanggil", "Speaker"],
  ["08.18", "SOAP & resep dicatat", "Dokter"],
  ["08.32", "Obat dan tagihan selesai", "Apoteker"],
];

export function HeroSection({ doctorCount, departmentCount }: { doctorCount: number; departmentCount: number }) {
  return <section className="kc-hero">
    <Image src="/images/hero-medical-team.jpg" alt="Tim dokter dan tenaga kesehatan KlinikCare" fill priority sizes="100vw" className="kc-hero-background" />
    <div className="kc-hero-background-shade" aria-hidden="true" />
    <div className="kc-hero-orb kc-hero-orb-one" />
    <div className="kc-hero-orb kc-hero-orb-two" />
    <div className="kc-shell kc-hero-grid">
      <div className="kc-hero-copy">
        <p className="kc-kicker kc-hero-motion"><span /> Demo operasional klinik end-to-end</p>
        <h1 className="kc-display kc-hero-motion">Satu klinik.<br/><em>Semua peran terhubung.</em></h1>
        <p className="kc-hero-lead kc-hero-motion">Jelajahi simulasi pelayanan lengkap—mulai dari pendaftaran pasien, antrean bersuara, pemeriksaan dokter, resep, stok obat, sampai pembayaran.</p>
        <div className="kc-hero-actions kc-hero-motion">
          <Link href="/login#demo" className="kc-button">Coba dashboard demo <ArrowRight size={17} /></Link>
          <a href="#dokter" className="kc-button-secondary">Lihat semua dokter</a>
        </div>
        <div className="kc-trust-list kc-hero-motion">
          <span><Check size={15} /> Data sepenuhnya simulasi</span>
          <span><Check size={15} /> 4 role siap dicoba</span>
          <span><Check size={15} /> Tanpa password demo</span>
        </div>
      </div>
      <aside className="kc-hero-console kc-hero-motion" aria-label="Contoh alur operasional KlinikCare">
        <div className="kc-console-head"><div><span className="kc-live-dot" /> Live care flow</div><Sparkles size={17}/></div>
        <div className="kc-console-patient"><span>RM</span><div><small>Kunjungan simulasi</small><b>Sari Wulandari · Poli Umum</b></div><CircleCheck size={20}/></div>
        <div className="kc-console-flow">{liveFlow.map(([time,title,role],index)=><div key={title} className="kc-console-row"><time>{time}</time><i>{index+1}</i><div><b>{title}</b><span>{role}</span></div></div>)}</div>
        <div className="kc-console-total"><span>Estimasi tagihan</span><b>Rp128.000</b><small>Konsultasi + 2 item obat</small></div>
      </aside>
    </div>
    <div className="kc-shell kc-proof kc-hero-motion">
      <p>Isi demo yang dapat dijelajahi</p>
      <div><b>{departmentCount} Poli</b><span>Layanan rawat jalan</span></div>
      <div><b>{doctorCount} Dokter</b><span>Umum & spesialis</span></div>
      <div><b>4 Role</b><span>Pasien hingga farmasi</span></div>
    </div>
  </section>;
}
