export function LocationSection() {
  return (
    <section id="lokasi" className="pad grid-bg">
      <div className="wrap">
        <p className="eyebrow text-[#2F80C0] mb-3">LOKASI RUMAH SAKIT</p>
        <h2 className="text-[#0B2D45] font-extrabold text-2xl sm:text-3xl">
          Lokasi Rumah Sakit
        </h2>
        <p className="mt-3 text-[#315066] text-base max-w-2xl">
          Temukan kami dengan mudah di kawasan Jakarta Selatan
        </p>

        <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-8 mt-8 items-stretch">
          <div className="location-map">
            <iframe
              title="Peta lokasi RS Cakrawala Medika"
              src="https://www.google.com/maps?q=Jl.+Kesehatan+Raya+No.+18,+Jakarta+Selatan&z=15&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <aside className="bg-white rounded-3xl p-7 shadow-lg border border-[#d5e2eb] flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xl text-[#0B2D45]">
                Temukan kami dengan mudah
              </h3>
              <p className="mt-5 text-[#315066] text-base leading-relaxed">
                Jl. Kesehatan Raya No. 18, Jakarta Selatan
              </p>
              <p className="mt-3 text-[#315066] text-base font-semibold">
                Telp: +62 21 555 7788
              </p>
              <p className="mt-3 text-[#0B2D45] font-bold text-base">
                IGD 24 Jam: +62 21 555 7799
              </p>
              <p className="mt-3 text-[#4c6475] text-sm">
                Pelayanan Poli: Senin–Sabtu, 08.00–20.00
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Jl.+Kesehatan+Raya+No.+18%2C+Jakarta+Selatan"
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-[#0B2D45] text-white !py-2.5 !text-sm"
              >
                Lihat Alamat di Peta
              </a>
              <a href="#kontak" className="btn outline-btn !py-2.5 !text-sm">
                Hubungi Kami
              </a>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Jl.+Kesehatan+Raya+No.+18%2C+Jakarta+Selatan"
                target="_blank"
                rel="noopener noreferrer"
                className="btn outline-btn !py-2.5 !text-sm"
              >
                Petunjuk Arah
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
