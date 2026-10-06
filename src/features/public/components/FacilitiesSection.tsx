"use client";

export function FacilitiesSection() {
  return (
    <section id="fasilitas" className="pad mesh" aria-labelledby="facility-title">
      <div className="wrap">
        <p className="eyebrow mb-3 text-[#2F80C0]">INFORMASI LAYANAN</p>
        <h2 id="facility-title" className="text-[#0B2D45] font-extrabold text-2xl sm:text-3xl">
          Layanan & Fasilitas Kami
        </h2>
        <p className="mt-4 max-w-2xl text-[#315066] text-base leading-relaxed">
          Informasi jam layanan dan manfaat utama tersedia secara ringkas untuk membantu Anda merencanakan kunjungan.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-[#0B2D45]">Instalasi Farmasi</h3>
              <p className="mt-3 text-sm text-[#4c6475] leading-relaxed">
                Senin–Sabtu, 08.00–20.00. Membantu kebutuhan obat sesuai resep dan edukasi penggunaan terarah.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-[#0B2D45]">Rehabilitasi Medik</h3>
              <p className="mt-3 text-sm text-[#4c6475] leading-relaxed">
                Senin–Jumat, 08.00–17.00. Program pemulihan bertahap dengan pendampingan tenaga profesional.
              </p>
            </div>
            <a href="#janji" className="btn !py-2.5 !text-sm mt-5">Buat Janji</a>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-[#0B2D45]">Ruang Tunggu Nyaman</h3>
              <p className="mt-3 text-sm text-[#4c6475] leading-relaxed">
                Area berpendingin udara yang bersih dan tertata ramah untuk pasien serta keluarga pendamping.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-[#0B2D45]">Ambulans Siaga</h3>
              <p className="mt-3 text-sm text-[#4c6475] leading-relaxed">
                Hubungi IGD 24 jam untuk informasi dan koordinasi bantuan transportasi medis darurat.
              </p>
            </div>
            <a href="tel:+62215557799" className="btn !py-2.5 !text-sm mt-5">Hubungi IGD</a>
          </div>
        </div>
      </div>
    </section>
  );
}
