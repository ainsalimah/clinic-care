"use client";

export function QuickCtaBanner() {
  return (
    <section className="pad hero" aria-label="Akses cepat">
      <div className="wrap flex flex-wrap items-center justify-between gap-5">
        <div>
          <h2 className="text-white font-extrabold text-2xl sm:text-3xl">
            Siap merencanakan kunjungan?
          </h2>
          <p className="mt-3 text-white/90 text-base">
            Tim pendaftaran siap membantu Anda dan keluarga.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="#janji" className="btn white-btn font-bold">
            Buat Janji
          </a>
          <a href="tel:+62215557799" className="btn border-btn font-bold">
            Hubungi IGD
          </a>
          <a href="#dokter" className="btn border-btn font-bold">
            Cari Dokter
          </a>
        </div>
      </div>
    </section>
  );
}
