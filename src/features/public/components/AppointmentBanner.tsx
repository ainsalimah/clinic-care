import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck } from "lucide-react";

export function AppointmentBanner() {
  return <section className="kc-cta-wrap kc-reveal"><div className="kc-shell"><div className="kc-cta-card">
    <div className="kc-cta-ring kc-ring-one" /><div className="kc-cta-ring kc-ring-two" />
    <div><p className="kc-cta-kicker"><CalendarDays size={15} /> Pendaftaran rawat jalan</p><h2 className="kc-display">Waktu Anda berharga.<br/><em>Jadwalkan dengan tenang.</em></h2><p>Pilih dokter dan waktu praktik yang sesuai. Kami bantu menjaga alur kunjungan tetap rapi sejak Anda tiba.</p><span className="kc-privacy-note"><ShieldCheck size={15} /> Identitas dan rekam medis dijaga secara aman.</span></div>
    <div className="kc-cta-actions"><Link href="/register" className="kc-button kc-button-light">Buat janji sekarang <ArrowRight size={16} /></Link><Link href="/login" className="kc-button-dark-ghost">Masuk ke akun</Link></div>
  </div></div></section>;
}
