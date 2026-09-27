import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin, UserCheck } from "lucide-react";

export function AboutSection() {
  return (
    <section className="border-y border-[#e2eae4] bg-[#f4f7f5] py-16 sm:py-20 lg:py-24" id="tentang">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Pengantar Klinik */}
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#187560]">
              Pengantar Klinik
            </p>
            <h2 className="mt-3 font-jakarta text-2xl font-extrabold tracking-tight text-[#143c34] sm:text-3xl lg:text-4xl">
              Standar pelayanan primer yang tenang dan tertata.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-[#4a655c] sm:text-base">
              KlinikCare didirikan untuk menghadirkan pelayanan kesehatan rawat jalan yang manusiawi
              dan efisien. Setiap proses konsultasi didukung pencatatan rekam medis terpadu dan
              instalasi farmasi internal, memastikan kontinuitas perawatan keluarga Anda berlangsung
              aman dan akurat.
            </p>

            {/* Operational Details - Concise, real clinic data */}
            <div className="mt-8 space-y-3.5 border-t border-[#d8e4dc] pt-6 text-xs sm:text-sm">
              <div className="flex items-start gap-3 text-[#3d5a50]">
                <Clock size={17} className="mt-0.5 shrink-0 text-[#187560]" />
                <div>
                  <span className="font-semibold text-[#164137]">Waktu Pelayanan:</span>
                  <p className="mt-0.5 text-[#516d63]">
                    Senin – Jumat 08.00–21.00 WIB · Sabtu 08.00–14.00 WIB
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-[#3d5a50]">
                <MapPin size={17} className="mt-0.5 shrink-0 text-[#187560]" />
                <div>
                  <span className="font-semibold text-[#164137]">Lokasi Layanan:</span>
                  <p className="mt-0.5 text-[#516d63]">
                    Jl. Kesehatan Raya No. 12, Bandung, Jawa Barat
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pilihan Daftar Online vs Datang Langsung */}
          <div className="lg:col-span-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#187560]">
                Pilihan Pendaftaran
              </p>
              <h3 className="mt-2 font-jakarta text-xl font-bold tracking-tight text-[#143c34] sm:text-2xl">
                Dua cara fleksibel memulai pemeriksaan kesehatan Anda
              </h3>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {/* Option 1: Online */}
              <div className="flex flex-col justify-between border-t-2 border-[#187560] bg-white p-6 sm:p-7">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#187560]">
                    <CalendarDays size={16} />
                    Pilihan 01
                  </div>
                  <h4 className="mt-3 font-jakarta text-lg font-bold text-[#143c34]">
                    Daftar Secara Online
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#516f64] sm:text-sm">
                    Pilih poli, dokter, dan jadwal praktik yang cocok dari rumah. Ideal untuk pasien
                    yang ingin merencanakan waktu konsultasi tanpa menunggu di antrean registrasi.
                  </p>
                </div>
                <div className="mt-6 border-t border-[#edf2ee] pt-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#187560] transition hover:text-[#0e483c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
                  >
                    Daftar Janji Sekarang <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Option 2: Datang Langsung */}
              <div className="flex flex-col justify-between border-t-2 border-[#547a6d] bg-white p-6 sm:p-7">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#547a6d]">
                    <UserCheck size={16} />
                    Pilihan 02
                  </div>
                  <h4 className="mt-3 font-jakarta text-lg font-bold text-[#143c34]">
                    Datang Langsung (Walk-In)
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#516f64] sm:text-sm">
                    Staf meja pendaftaran siap membantu registrasi pasien baru atau pencarian data
                    rekam medis lama. Sangat ramah untuk pasien lansia tanpa memerlukan smartphone.
                  </p>
                </div>
                <div className="mt-6 border-t border-[#edf2ee] pt-4">
                  <a
                    href="#alur"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#547a6d] transition hover:text-[#143c34] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
                  >
                    Pelajari Alur Check-in <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </div>

            {/* Note info box */}
            <div className="mt-6 rounded-lg bg-[#eaf2ed] px-4 py-3 text-xs leading-relaxed text-[#3d5d51]">
              <span className="font-semibold text-[#185e4e]">Catatan Urutan Pelayanan: </span>
              Nomor antrean fisik resmi diterbitkan saat Anda melakukan <b>check-in</b> di meja
              resepsionis pada hari kunjungan, baik untuk pendaftaran online maupun walk-in.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
