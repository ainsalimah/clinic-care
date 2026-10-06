"use client";

export function QuickMeshSection() {
  return (
    <section className="mesh px-5 py-6" aria-label="Informasi cepat">
      <div className="wrap grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="tel:+62215557799"
          className="bg-white rounded-2xl p-5 font-bold text-[#0B2D45] shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
        >
          <span>IGD: +62 21 555 7799</span>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">24 Jam</span>
        </a>
        <a
          href="#janji"
          className="bg-white rounded-2xl p-5 font-bold text-[#0B2D45] shadow-sm hover:shadow-md transition-shadow"
        >
          Pendaftaran Kunjungan
        </a>
        <a
          href="#lokasi"
          className="bg-white rounded-2xl p-5 font-bold text-[#0B2D45] shadow-sm hover:shadow-md transition-shadow"
        >
          Lokasi Rumah Sakit
        </a>
        <a
          href="#pembiayaan"
          className="bg-white rounded-2xl p-5 font-bold text-[#2F80C0] shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
        >
          <span>BPJS, Asuransi & Pembayaran</span>
          <span className="text-xs bg-blue-100 text-[#2F80C0] px-2 py-1 rounded-full">Informasi</span>
        </a>
      </div>
    </section>
  );
}
