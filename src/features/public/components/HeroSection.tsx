import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Check } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[#e5ede7] bg-[#f9fbf9]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Text Column */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-md bg-[#eaf3ed] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#145c4d]">
              <span className="size-1.5 rounded-full bg-[#187560]" />
              Pelayanan Rawat Jalan & Farmasi
            </div>

            <h1 className="mt-5 font-jakarta text-3xl font-extrabold leading-[1.18] tracking-tight text-[#143c34] sm:text-4xl lg:text-[2.85rem]">
              Perawatan medis yang tenang, terstruktur, dan terpercaya.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#49665c] sm:text-lg">
              KlinikCare menyelenggarakan konsultasi dokter umum dan spesialis dengan kepastian jadwal,
              rekam medis digital terpadu, serta instalasi obat langsung di tempat. Pasien dapat
              memilih mendaftar secara online dari rumah atau datang langsung ke klinik.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#145c4d] px-6 text-sm font-semibold text-white transition hover:bg-[#0e483c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560] focus-visible:ring-offset-2"
              >
                Buat Janji Kunjungan <ArrowRight size={15} />
              </Link>
              <a
                href="#dokter"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#cddcd2] bg-white px-6 text-sm font-semibold text-[#1c4b3e] transition hover:border-[#187560] hover:bg-[#f4f8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
              >
                Lihat Jadwal Praktik <Calendar size={15} />
              </a>
            </div>

            {/* Real verified commitments */}
            <div className="mt-10 border-t border-[#e2ece5] pt-6">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <li className="flex items-center gap-2.5 text-xs font-medium text-[#46655a]">
                  <Check size={16} className="shrink-0 text-[#187560]" />
                  <span>Dokter ber-SIP resmi</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs font-medium text-[#46655a]">
                  <Check size={16} className="shrink-0 text-[#187560]" />
                  <span>Rekam medis & resep digital</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs font-medium text-[#46655a]">
                  <Check size={16} className="shrink-0 text-[#187560]" />
                  <span>Daftar online & walk-in</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Photo Column - Merging naturally to the layout edge */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-[#dde7e0] bg-[#eef4f0]">
              <div className="relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[4/5] xl:aspect-[3/4]">
                <Image
                  src="/images/hero-medical-team.jpg"
                  alt="Tim Medis KlinikCare"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 40vw"
                  className="h-full w-full object-cover object-[center_12%]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
