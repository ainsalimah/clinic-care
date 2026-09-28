import Link from "next/link";
import { ArrowRight, FlaskConical, ShieldCheck } from "lucide-react";

export function AppointmentBanner() {
  return <section className="kc-cta-wrap kc-reveal"><div className="kc-shell"><div className="kc-cta-card">
    <div className="kc-cta-ring kc-ring-one" /><div className="kc-cta-ring kc-ring-two" />
    <div><p className="kc-cta-kicker"><FlaskConical size={15} /> Siap diuji langsung</p><h2 className="kc-display">Pilih satu role.<br/><em>Ikuti alurnya sampai selesai.</em></h2><p>Masuk tanpa password sebagai resepsionis, dokter, apoteker, atau pasien. Semua role bekerja pada data simulasi yang sama.</p><span className="kc-privacy-note"><ShieldCheck size={15} /> Akun Admin tidak dibuka pada demo publik.</span></div>
    <div className="kc-cta-actions"><Link href="/login#demo" className="kc-button kc-button-light">Buka mode demo <ArrowRight size={16} /></Link><Link href="/register" className="kc-button-dark-ghost">Coba daftar pasien</Link></div>
  </div></div></section>;
}
