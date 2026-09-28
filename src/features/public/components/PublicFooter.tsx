import Link from "next/link";
import { Clock3, HeartPulse, MapPin, Phone } from "lucide-react";

export function PublicFooter() {
  return <footer className="kc-footer"><div className="kc-shell">
    <div className="kc-footer-grid">
      <div><Link href="/" className="kc-brand kc-brand-footer"><span className="kc-brand-mark"><HeartPulse size={20}/></span><span><b>KlinikCare</b><small>Clinical operations demo</small></span></Link><p className="kc-footer-summary">Demo sistem klinik terpadu dari pendaftaran sampai farmasi. Seluruh identitas dan transaksi yang tampil merupakan data simulasi.</p></div>
      <div><h3>Jelajahi</h3><a href="#demo">Empat role demo</a><a href="#poli">Poli & layanan</a><a href="#dokter">Semua dokter</a><a href="#alur">Alur kunjungan</a></div>
      <div><h3>Data simulasi</h3><p><MapPin size={15}/> Jl. Kesehatan Raya No. 12, Bandung</p><p><Clock3 size={15}/> Senin–Jumat, 08.00–21.00</p><p><Phone size={15}/> (022) 8765-4321</p></div>
      <div><h3>Mulai mencoba</h3><Link href="/login#demo">Pilih role demo</Link><Link href="/register">Daftar pasien baru</Link><Link href="/forgot-password">Uji pemulihan akun</Link></div>
    </div>
    <div className="kc-footer-bottom"><span>© {new Date().getFullYear()} KlinikCare</span><span>Portofolio produk · seluruh data bersifat dummy.</span></div>
  </div></footer>;
}
