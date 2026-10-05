/* eslint-disable @next/next/no-img-element */
"use client";

const supportingServices = [
  {
    id: "igd",
    title: "IGD 24 Jam",
    image: "/images/landing/emergency.jpg",
    alt: "Tim medis melakukan tindakan di ruang operasi yang dilengkapi peralatan medis.",
    copy: "Tim darurat siap sepanjang hari. Untuk kondisi mendesak, langsung datang atau telepon IGD tanpa menunggu janji.",
    linkText: "Telepon IGD",
    href: "tel:+62215557799",
  },
  {
    id: "poli",
    title: "Poliklinik Spesialis",
    image: "/images/landing/clinic.jpg",
    alt: "Dokter perempuan berkonsultasi dengan pasien di ruang praktik modern.",
    copy: "Sepuluh bidang spesialis dengan jadwal terencana dan konsultasi yang personal.",
    linkText: "Lihat Semua Dokter",
    href: "#dokter",
  },
  {
    id: "inpatient",
    title: "Rawat Inap",
    image: "/images/landing/inpatient.jpg",
    alt: "Kamar rumah sakit modern dengan tempat tidur yang dapat disesuaikan dan peralatan medis.",
    copy: "Ruang nyaman dan pendampingan perawat sepanjang hari. Ketersediaan kamar dikonfirmasi oleh tim admisi.",
    linkText: "Informasi Rawat Inap",
    href: "#janji",
  },
  {
    id: "lab",
    title: "Laboratorium",
    image: "/images/landing/lab.jpg",
    alt: "Petugas berjas laboratorium menggunakan monitor senth di laboratorium modern.",
    copy: "Pemeriksaan darah, urine, dan kimia klinik. Tim kami menjelaskan persiapan pemeriksaan sebelum kedatangan.",
    linkText: "Daftar Skrining Lab",
    href: "#janji",
  },
  {
    id: "rad",
    title: "Radiologi",
    image: "/images/landing/radiology.jpg",
    alt: "Tenaga medis memeriksa gambar sinar-X paru-paru di lingkungan klinis.",
    copy: "Layanan pencitraan dan pembacaan hasil oleh dokter spesialis untuk mendukung evaluasi klinis.",
    linkText: "Layanan Pencitraan",
    href: "#janji",
  },
  {
    id: "checkup",
    title: "Pemeriksaan Kesehatan Berkala",
    image: "/images/landing/checkup.jpg",
    alt: "Petugas kesehatan memeriksa tekanan darah pasien di ruang praktik.",
    copy: "Rencanakan pemeriksaan preventif sesuai kebutuhan. Jenis pemeriksaan dan persiapan dikonfirmasi sebelum kunjungan.",
    linkText: "Buat Janji Checkup",
    href: "#janji",
  },
];

interface ServicesSectionProps {
  departments: { id: string; name: string; description: string | null }[];
}

export function ServicesSection({ departments }: ServicesSectionProps) {
  const services = departments.length
    ? departments.map((department, index) => ({
      id: department.id,
      title: department.name,
      image: supportingServices[index % supportingServices.length].image,
      alt: supportingServices[index % supportingServices.length].alt,
      copy: department.description ?? "Konsultasi dan pemeriksaan dengan jadwal yang dapat Anda lihat pada direktori dokter.",
      linkText: "Lihat Dokter",
      href: "#dokter",
    }))
    : supportingServices;
  return (
    <section id="layanan" className="pad grid-bg">
      <div className="wrap">
        <p className="eyebrow mb-3 text-[#2F80C0]">LAYANAN UNGGULAN</p>
        <h2 className="text-[#0B2D45] font-extrabold text-2xl sm:text-3xl">
          Perawatan yang Anda Butuhkan, Dalam Satu Tempat
        </h2>
        <p className="mt-4 max-w-2xl text-[#315066] text-base leading-relaxed">
          Dari pemeriksaan rutin hingga perawatan lanjutan, tim kami membantu Anda memahami setiap langkah pelayanan.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {services.map((item) => (
            <article key={item.id} className="image-card service">
              <img src={item.image} alt={item.alt} loading="lazy" />
              <div className="shade" />
              <div className="card-copy">
                <h3 className="font-bold text-white text-xl">{item.title}</h3>
                <p className="mt-2 text-white/90 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {item.copy}
                </p>
                <a href={item.href} className="inline-block mt-4 underline font-bold text-white text-sm sm:text-base">
                  {item.linkText}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
