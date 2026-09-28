import Link from "next/link";
import { Clock3, HeartPulse, MapPin, Phone } from "lucide-react";

export function PublicFooter() {
  return <footer className="kc-footer"><div className="kc-shell">
    <div className="kc-footer-grid">
      <div><Link href="/" className="kc-brand kc-brand-footer"><span className="kc-brand-mark"><HeartPulse size={20}/></span><span><b>KlinikCare</b><small>Rawat jalan & farmasi</small></span></Link><p className="kc-footer-summary">Pelayanan kesehatan keluarga yang tertata, inklusif, dan terhubung dari konsultasi sampai farmasi.</p></div>
      <div><h3>Jelajahi</h3><a href="#poli">Poli & layanan</a><a href="#dokter">Jadwal dokter</a><a href="#alur">Alur kunjungan</a><a href="#faq">Tanya jawab</a></div>
      <div><h3>Kunjungi kami</h3><p><MapPin size={15}/> Jl. Kesehatan Raya No. 12, Bandung</p><p><Clock3 size={15}/> Senin—Jumat, 08.00—21.00</p><p><Phone size={15}/> (022) 8765-4321</p></div>
      <div><h3>Akses pasien</h3><Link href="/register">Daftar pasien baru</Link><Link href="/login">Masuk akun</Link><Link href="/forgot-password">Lupa kata sandi</Link></div>
    </div>
    <div className="kc-footer-bottom"><span>© {new Date().getFullYear()} KlinikCare</span><span>Pelayanan yang tenang, untuk setiap keluarga.</span></div>
  </div></footer>;
}
