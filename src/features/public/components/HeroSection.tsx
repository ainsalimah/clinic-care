/* eslint-disable @next/next/no-img-element */
"use client";


export function HeroSection() {
  return (
    <section id="beranda" className="hero pad">
      <div className="wrap grid lg:grid-cols-2 gap-12 items-center">
        <div className="rise">
          <p className="eyebrow mb-5 text-[#E8EEF2] tracking-[0.13rem] font-bold text-xs">
            LAYANAN KESEHATAN TERPADU
          </p>
          <h1 className="font-extrabold text-white text-4xl sm:text-5xl leading-[1.1] tracking-[-0.04em]">
            Kesehatan Anda, Prioritas Kami
          </h1>
          <p className="mt-6 text-white/90 text-lg sm:text-xl font-normal leading-relaxed">
            Di RS Cakrawala Medika, keahlian medis dan perhatian tulus hadir bersama untuk mendampingi kesehatan Anda dan keluarga.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <a href="#janji" className="btn white-btn !font-bold">
              Buat Janji Sekarang
            </a>
            <a href="tel:+62215557799" className="btn border-btn" aria-label="Hubungi IGD 24 jam">
              Telepon IGD
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/25 mt-10 pt-6">
            <div>
              <p className="font-bold text-lg text-white">IGD 24 Jam</p>
              <p className="text-sm text-white/80">Siaga Setiap Hari</p>
            </div>
            <div>
              <p className="font-bold text-lg text-white">10 Dokter Spesialis</p>
              <p className="text-sm text-white/80">Jadwal Terjadwal</p>
            </div>
            <div>
              <p className="font-bold text-lg text-white">15 Tahun Melayani</p>
              <p className="text-sm text-white/80">Terpercaya di Jaksel</p>
            </div>
          </div>
        </div>

        <div className="image-card h-[460px] sm:h-[480px] rise lg:rounded-tl-[90px]">
          <img
            src="/images/landing/hero.jpg"
            alt="Dokter berkonsultasi dengan pasien di klinik modern yang terang."
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="shade" />
          <p className="card-copy text-white font-semibold text-base sm:text-lg">
            Pendampingan yang hangat, komunikasi yang jelas.
          </p>
        </div>
      </div>
    </section>
  );
}
