import Link from "next/link";
import { ArrowRight, CalendarCheck, FlaskConical, ShieldCheck, Sparkles } from "lucide-react";

export function AppointmentBanner() {
  return (
    <section className="kc-cta-section kc-reveal">
      <div className="kc-shell">
        <div className="kc-cta-box">
          {/* Ambient Lighting Rings */}
          <div className="kc-cta-ring kc-cta-ring-1" aria-hidden="true" />
          <div className="kc-cta-ring kc-cta-ring-2" aria-hidden="true" />

          <div className="kc-cta-content">
            <div className="kc-cta-kicker">
              <FlaskConical size={15} />
              <span>Siap Diuji Kapan Saja</span>
            </div>

            <h2 className="kc-cta-heading">
              Pilih satu peran klinis.<br />
              <em>Ikuti alurnya dari awal hingga tuntas.</em>
            </h2>

            <p className="kc-cta-desc">
              Uji langsung tanpa repot membuat akun atau password. Masuk sebagai resepsionis, dokter,
              apoteker, atau pasien untuk merasakan bagaimana alur data mengalir secara instan dan tanpa jeda.
            </p>

            <div className="kc-cta-actions">
              <Link href="/#demo" className="kc-btn-cta-light">
                <Sparkles size={17} />
                <span>Buka Mode Demo 4-Role</span>
                <ArrowRight size={17} />
              </Link>
              <Link href="/register" className="kc-btn-cta-ghost">
                <CalendarCheck size={17} />
                <span>Coba Daftar Pasien Baru</span>
              </Link>
            </div>

            <div className="kc-cta-guarantees">
              <div className="kc-cta-guarantee-item">
                <ShieldCheck size={15} />
                <span>100% Simulasi Terisolasi & Aman</span>
              </div>
              <span className="kc-cta-sep" />
              <div className="kc-cta-guarantee-item">
                <Sparkles size={15} />
                <span>Tanpa Registrasi Kartu Kredit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
