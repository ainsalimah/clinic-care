import Link from "next/link";
import {
  Clock3,
  HeartPulse,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="kc-footer">
      <div className="kc-shell">
        <div className="kc-footer-grid">
          {/* Brand Column */}
          <div className="kc-footer-brand-col">
            <Link href="/" className="kc-brand kc-brand-footer" aria-label="KlinikCare Beranda">
              <span className="kc-brand-mark">
                <HeartPulse size={22} strokeWidth={2.4} />
              </span>
              <span className="kc-brand-text">
                <span className="kc-brand-title">
                  <b style={{ color: "#ffffff" }}>Klinik</b>
                  <b className="kc-brand-accent">Care</b>
                </span>
                <small style={{ color: "#9ca3af" }}>Klinik Pratama Terpadu</small>
              </span>
            </Link>
            <p className="kc-footer-summary">
              Sistem informasi pelayanan klinik modern: pendaftaran mandiri, antrean bersuara multi-ruang,
              rekam medis SOAP terstandar, dan instalasi farmasi terintegrasi.
            </p>
            <div className="kc-footer-shield-pill">
              <ShieldCheck size={14} />
              <span>Simulasi Produk Layanan Kesehatan Terpadu</span>
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="kc-footer-col">
            <h3>Navigasi Layanan</h3>
            <a href="#demo">Simulasi 4 Role Demo</a>
            <a href="#poli">Direktori Layanan Poli</a>
            <a href="#dokter">Jadwal & Profil Dokter</a>
            <a href="#tentang">Standar Operasional</a>
            <a href="#alur">Alur Kunjungan Pasien</a>
            <a href="#faq">Tanya Jawab (FAQ)</a>
          </div>

          {/* Operating Information Column */}
          <div className="kc-footer-col">
            <h3>Informasi Fasilitas</h3>
            <p>
              <MapPin size={16} className="text-emerald-400 flex-shrink-0" />
              <span>Jl. Kesehatan Raya No. 12, Bandung (Simulasi)</span>
            </p>
            <p>
              <Clock3 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>Senin–Jumat: 08.00–21.00 WIB<br />Sabtu: 08.00–14.00 WIB</span>
            </p>
            <p>
              <Phone size={16} className="text-emerald-400 flex-shrink-0" />
              <span>(022) 8765-4321</span>
            </p>
          </div>

          {/* Access & Test Portals Column */}
          <div className="kc-footer-col">
            <h3>Akses & Pengujian</h3>
            <Link href="/login#demo">Masuk Role Demo Instan</Link>
            <Link href="/register">Pendaftaran Pasien Baru</Link>
            <Link href="/login">Portal Staf Medis & Kasir</Link>
            <Link href="/forgot-password">Simulasi Reset Password</Link>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="kc-footer-bottom">
          <span>
            © {new Date().getFullYear()} KlinikCare. Seluruh hak cipta dilindungi.
          </span>
          <span className="kc-footer-tagline">
            Dirancang dengan empati untuk kenyamanan pasien dan ketelitian tim medis.
          </span>
        </div>
      </div>
    </footer>
  );
}
