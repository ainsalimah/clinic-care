import Link from "next/link";
import { Clock, HeartPulse, MapPin, Phone } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-[#12382f] bg-[#0b2620] text-[#bed4cb]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="grid gap-10 md:grid-cols-12 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-[#187560] text-white">
                <HeartPulse size={18} />
              </span>
              <span className="font-jakarta text-xl font-extrabold tracking-tight">
                Klinik<span className="text-[#41b99a]">Care</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#92b5a7]">
              Fasilitas pelayanan kesehatan primer rawat jalan dengan dokter umum dan spesialis,
              rekam medis digital terpadu, serta instalasi farmasi langsung di klinik.
            </p>
            <p className="mt-4 text-xs text-[#719888]">
              Sistem Informasi Klinik & Pelayanan Rawat Jalan Terpadu
            </p>
          </div>

          {/* Quick Nav Col */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6ec2ab]">
              Navigasi Halaman
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="#poli"
                  className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
                >
                  Poli & Layanan
                </a>
              </li>
              <li>
                <a
                  href="#tentang"
                  className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
                >
                  Pengantar Klinik
                </a>
              </li>
              <li>
                <a
                  href="#dokter"
                  className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
                >
                  Jadwal & Profil Dokter
                </a>
              </li>
              <li>
                <a
                  href="#alur"
                  className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
                >
                  Alur Kunjungan Pasien
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
                >
                  Tanya Jawab (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* Contact and Operational Info */}
          <div className="md:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6ec2ab]">
              Informasi Operasional
            </h3>
            <div className="mt-4 space-y-3 text-sm text-[#9cbdb0]">
              <div className="flex items-start gap-2.5">
                <Clock size={16} className="mt-0.5 shrink-0 text-[#41b99a]" />
                <div>
                  <span className="font-semibold text-white">Jam Buka:</span>
                  <p className="text-xs sm:text-sm">
                    Senin – Jumat: 08.00 – 21.00 WIB
                    <br />
                    Sabtu: 08.00 – 14.00 WIB
                    <br />
                    <span className="text-[#729c8c]">Minggu & Hari Libur Tutup</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#41b99a]" />
                <p className="text-xs sm:text-sm">
                  Jl. Kesehatan Raya No. 12, Bandung, Jawa Barat
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone size={16} className="mt-0.5 shrink-0 text-[#41b99a]" />
                <p className="text-xs sm:text-sm">(022) 8765-4321 / 0812-3456-7890</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#133a30] pt-6 text-xs text-[#6d9686] sm:flex-row">
          <p>© {new Date().getFullYear()} KlinikCare. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="transition hover:text-white">
              Akses Masuk
            </Link>
            <Link href="/register" className="transition hover:text-white">
              Pendaftaran Pasien
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
