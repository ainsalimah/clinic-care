"use client";

export function StepsSection() {
  return (
    <section className="pad mesh">
      <div className="wrap">
        <h2 className="text-center text-[#0B2D45] font-extrabold text-2xl sm:text-3xl">
          Cara Membuat Janji
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mt-9">
          <article className="bg-white rounded-3xl p-7 shadow-sm">
            <span aria-hidden="true" className="font-bold text-[#2F80C0] text-lg">01 /</span>
            <h3 className="font-bold text-xl text-[#0B2D45] mt-4">Pilih Dokter atau Layanan</h3>
            <p className="mt-3 text-[#315066] text-base leading-relaxed">
              Lihat profil dan jadwal praktik untuk merencanakan kunjungan.
            </p>
          </article>

          <article className="bg-white rounded-3xl p-7 shadow-sm">
            <span aria-hidden="true" className="font-bold text-[#2F80C0] text-lg">02 /</span>
            <h3 className="font-bold text-xl text-[#0B2D45] mt-4">Ajukan Tanggal Kunjungan</h3>
            <p className="mt-3 text-[#315066] text-base leading-relaxed">
              Lengkapi nama dan nomor telepon pada formulir permintaan janji.
            </p>
          </article>

          <article className="bg-white rounded-3xl p-7 shadow-sm">
            <span aria-hidden="true" className="font-bold text-[#2F80C0] text-lg">03 /</span>
            <h3 className="font-bold text-xl text-[#0B2D45] mt-4">Tunggu Konfirmasi</h3>
            <p className="mt-3 text-[#315066] text-base leading-relaxed">
              Tim pendaftaran menghubungi Anda untuk memastikan jadwal sebelum kedatangan.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
