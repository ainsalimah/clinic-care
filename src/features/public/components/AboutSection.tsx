/* eslint-disable @next/next/no-img-element */
"use client";

export function AboutSection() {
  return (
    <section id="tentang" className="pad mesh">
      <div className="wrap grid lg:grid-cols-2 gap-12 items-center">
        <div className="image-card h-[440px]">
          <img
            src="/images/landing/about.jpg"
            alt="Dua dokter meninjau informasi pada tablet di ruang kerja modern."
            loading="lazy"
          />
          <div className="shade" />
          <div className="card-copy">
            <p className="font-extrabold text-3xl text-white">Sejak 2011</p>
            <p className="mt-1 text-white/90 text-base">Melayani keluarga dengan sepenuh hati.</p>
          </div>
        </div>

        <div>
          <p className="eyebrow text-[#2F80C0] mb-3">MENGAPA MEMILIH KAMI</p>
          <h2 className="text-[#0B2D45] font-extrabold text-2xl sm:text-3xl">
            Keahlian Medis, Perhatian yang Lebih Personal
          </h2>
          <p className="mt-5 text-[#315066] text-base leading-relaxed">
            RS Cakrawala Medika hadir di Jakarta Selatan untuk memberikan pelayanan yang terkoordinasi, nyaman, dan mudah dipahami. Kami mengutamakan komunikasi terbuka serta keselamatan dalam setiap tahap perawatan.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-7">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F80C0] shrink-0" />
              <p className="font-semibold text-[#0B2D45] text-base">10 dokter spesialis lintas bidang</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F80C0] shrink-0" />
              <p className="font-semibold text-[#0B2D45] text-base">Fasilitas diagnostik terpadu</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F80C0] shrink-0" />
              <p className="font-semibold text-[#0B2D45] text-base">Pendampingan penuh empati</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F80C0] shrink-0" />
              <p className="font-semibold text-[#0B2D45] text-base">IGD siaga 24 jam</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
