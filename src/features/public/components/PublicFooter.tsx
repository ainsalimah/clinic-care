"use client";

export function PublicFooter() {
  return (
    <footer id="kontak" className="canva-footer bg-[#0B2D45] text-white px-5 pt-14">
      <div className="wrap grid sm:grid-cols-2 lg:grid-cols-4 gap-9 pb-10">
        <div>
          <p className="font-extrabold text-xl text-white">RS Cakrawala Medika</p>
          <p className="mt-4 text-white/80 text-sm leading-relaxed">
            Jl. Kesehatan Raya No. 18, Jakarta Selatan
          </p>
          <p className="mt-3 text-white/70 text-xs">
            Pelayanan kesehatan terintegrasi berbasis rekam medis digital.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-lg text-white">Kontak</h3>
          <a href="tel:+62215557788" className="block mt-4 text-white/80 hover:text-white text-sm">
            +62 21 555 7788
          </a>
          <a href="mailto:halo@cakrawalamedika.id" className="block mt-2 text-white/80 hover:text-white text-sm break-words">
            halo@cakrawalamedika.id
          </a>
          <a
            href="https://wa.me/628112345678"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-white/80 hover:text-white text-sm"
          >
            WhatsApp: +62 811 2345 678
          </a>
          <a href="tel:+62215557799" className="block mt-2 text-white font-bold text-sm">
            IGD: +62 21 555 7799
          </a>
        </div>

        <div>
          <h3 className="font-bold text-lg text-white">Jam Pelayanan</h3>
          <p className="mt-4 text-white/80 text-sm">
            Senin–Sabtu, 08.00–20.00
          </p>
          <p className="mt-2 text-white/80 text-sm">
            IGD buka 24 jam setiap hari.
          </p>
          <a href="#dokter" className="block mt-3 text-[#2F80C0] font-bold text-sm hover:underline">
            Direktori Dokter
          </a>
        </div>

        <div>
          <h3 className="font-bold text-lg text-white">Ikuti Kami</h3>
          <a
            href="https://www.instagram.com/cakrawalamedika/"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 text-white/80 hover:text-white text-sm"
          >
            @cakrawalamedika
          </a>
          <a
            href="https://www.facebook.com/cakrawalamedika/"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-white/80 hover:text-white text-sm"
          >
            RS Cakrawala Medika
          </a>
        </div>
      </div>

      <div className="wrap border-t border-white/20 py-6">
        <p className="text-white/60 text-xs text-center leading-relaxed">
          Situs ilustratif: identitas rumah sakit, dokter, jadwal, statistik, testimonial, dan kontak bersifat simulasi produk. Foto stok bukan identitas dokter nyata.
        </p>
        <p className="mt-3 text-white/60 text-xs text-center">
          © 2026 RS Cakrawala Medika / KlinikCare. Semua hak dilindungi.
        </p>

        <div className="flex justify-center gap-6 mt-4 pb-4 text-xs text-white/70">
          <a href="#beranda" className="hover:underline">Beranda</a>
          <a href="#layanan" className="hover:underline">Layanan</a>
          <a href="#dokter" className="hover:underline">Dokter</a>
          <a href="#pembiayaan" className="hover:underline">Pembiayaan</a>
        </div>
      </div>
    </footer>
  );
}
