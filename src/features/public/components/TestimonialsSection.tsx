import { Heart, Sparkles, Star } from "lucide-react";
import { testimonials } from "../content";

export function TestimonialsSection() {
  return (
    <section className="kc-testimonials-section kc-section" id="testimoni">
      <div className="kc-shell">
        <div className="kc-section-head-center kc-reveal">
          <p className="kc-eyebrow">
            <Sparkles size={13} />
            <span>Pengalaman Pasien</span>
          </p>
          <h2 className="kc-heading">
            Kepercayaan keluarga Anda,<br />
            <em>adalah dedikasi utama kami setiap hari.</em>
          </h2>
          <p className="kc-lead-p-center">
            Mendengar langsung pengalaman pasien rawat jalan yang telah merasakan kenyamanan antrean
            tertib, kejelasan penjelasan dokter spesialis, serta kesiapan obat yang tepat waktu.
          </p>
        </div>

        <div className="kc-testimonials-grid">
          {testimonials.map((t) => (
            <article key={t.id} className="kc-testimonial-card kc-reveal">
              <div className="kc-testimonial-top">
                <div className="kc-rating-stars" aria-label={`Rating ${t.rating} dari 5 bintang`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={i < t.rating ? "kc-star-filled" : "kc-star-empty"}
                    />
                  ))}
                </div>
                <span className="kc-testi-date">{t.visitDate}</span>
              </div>

              <blockquote className="kc-testi-quote">
                &ldquo;{t.comment}&rdquo;
              </blockquote>

              <div className="kc-testi-footer">
                <div className="kc-testi-avatar">
                  <span>{t.name.charAt(0)}</span>
                </div>
                <div className="kc-testi-author">
                  <b>{t.name}</b>
                  <small>{t.role}</small>
                </div>
                <div className="kc-testi-treated">
                  <span className="kc-treated-dept">{t.department}</span>
                  <span className="kc-treated-doc">{t.doctorName}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Quality Commitment Ribbon */}
        <div className="kc-commitment-box kc-reveal">
          <div className="kc-commitment-icon">
            <Heart size={22} className="text-rose-600" />
          </div>
          <div className="kc-commitment-text">
            <b>Komitmen Mutu & Keselamatan Pasien (Patient Safety)</b>
            <p>
              Setiap catatan medis, indikasi alergi obat, dan diagnosis terverifikasi langsung oleh dokter
              ber-SIP aktif sesuai panduan praktik klinis nasional.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
