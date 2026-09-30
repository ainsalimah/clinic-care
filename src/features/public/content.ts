export const weekdayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export interface PatientTestimonial {
  id: string;
  name: string;
  role: string;
  department: string;
  doctorName: string;
  rating: number;
  comment: string;
  visitDate: string;
}

export interface HospitalFacility {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  image: string;
}

export const testimonials: PatientTestimonial[] = [
  {
    id: "testi-1",
    name: "Ratna Wulandari",
    role: "Ibu Pasien Balita",
    department: "Poli Anak",
    doctorName: "dr. Maya Indah, Sp.A",
    rating: 5,
    comment:
      "Pelayanan Poli Anak sangat ramah dan menenangkan. Anak saya tidak takut saat diperiksa. Sistem antrean suaranya jelas sehingga kami tidak perlu bolak-balik menanyakan nomor antrean ke meja resepsionis.",
    visitDate: "Kunjungan September 2026",
  },
  {
    id: "testi-2",
    name: "Bapak Suyono",
    role: "Pasien Kontrol Rutin (67 th)",
    department: "Poli Penyakit Dalam",
    doctorName: "dr. Bambang Setiawan, Sp.PD",
    rating: 5,
    comment:
      "Sebagai lansia, saya sangat terbantu dengan staf resepsionis yang mendampingi pendaftaran manual. Penjelasan dokter sangat mendalam mengenai obat darah tinggi saya, dan obat langsung siap di apotek tanpa antre lama.",
    visitDate: "Kunjungan September 2026",
  },
  {
    id: "testi-3",
    name: "Kevin Ardiansyah",
    role: "Pasien Rawat Jalan",
    department: "Poli Gigi",
    doctorName: "drg. Fadhil Ramadhan",
    rating: 5,
    comment:
      "Pembersihan karang gigi (scaling) dilakukan dengan sangat higienis dan nyaman. Tarif konsultasinya transparan sejak awal pendaftaran online tanpa ada biaya tersembunyi saat di kasir.",
    visitDate: "Kunjungan Agustus 2026",
  },
];

export const facilities: HospitalFacility[] = [
  {
    id: "fac-1",
    title: "Ruang Konsultasi & Periksa Terstandar",
    subtitle: "Privasi Maksimal & Alat Medis Terkalibrasi",
    description:
      "Setiap poli dilengkapi ruang konsultasi tertutup, tempat tidur periksa higienis, tensimeter digital, stetoskop terstandar, serta monitor rekam medis terenkripsi.",
    tag: "Konsultasi Privat",
    image: "/images/hero_clinic_modern.jpg",
  },
  {
    id: "fac-2",
    title: "Instalasi Farmasi & Kasir Satu Pintu",
    subtitle: "Resep Digital Langsung Diracik Tanpa Antre Ganda",
    description:
      "Apoteker menerima resep secara digital seketika dokter menyelesaikan input SOAP. Stok terpotong otomatis, etiket dosis dicetak rapi, dan pembayaran terpadu tanpa berpindah loket.",
    tag: "Farmasi Terpadu",
    image: "/images/clinic_digital_ecosystem.jpg",
  },
  {
    id: "fac-3",
    title: "Ruang Tunggu Ergonomis & Display Antrean",
    subtitle: "Pemanggilan Audio Multi-Ruang Otomatis",
    description:
      "Ruang tunggu berpendingin udara dengan kursi ergonomis, air minum gratis, display status antrean per poli, serta speaker otomatis yang menyebutkan nomor panggilan menuju ruang dokter.",
    tag: "Kenyamanan Pasien",
    image: "/images/clinic-hero.jpg",
  },
  {
    id: "fac-4",
    title: "Akses Inklusif Ramah Difabel & Lansia",
    subtitle: "Ramp Kursi Roda & Pendampingan Meja Depan",
    description:
      "Akses bebas tangga dengan ramp landai, kursi roda siaga di lobi utama, toilet ramah disabilitas, serta pendampingan langsung oleh staf resepsionis bagi pasien berkebutuhan khusus.",
    tag: "Aksesibilitas 100%",
    image: "/images/medical-team.jpg",
  },
];

export const faqs = [
  [
    "Apakah pasien baru bisa mendaftar janji temu secara online?",
    "Sangat bisa. Anda dapat mendaftar mandiri melalui menu 'Daftar Janji' di situs KlinikCare, melengkapi identitas dasar, memilih poliklinik, dokter yang bertugas, serta tanggal kunjungan yang dikehendaki.",
  ],
  [
    "Kapan nomor antrean fisik diterbitkan untuk pemeriksaan?",
    "Nomor antrean resmi diterbitkan saat Anda tiba di klinik dan melakukan check-in di meja resepsionis pada hari kunjungan. Ini memastikan urutan pemeriksaan dokter tetap tertib, adil, dan transparan bagi semua pasien.",
  ],
  [
    "Bagaimana jika pasien lansia atau darurat datang langsung tanpa smartphone?",
    "KlinikCare mengutamakan inklusivitas. Staf meja depan kami selalu siaga mendampingi pendaftaran manual, memeriksa sisa kuota, serta memfasilitasi nomor antrean tanpa syarat menggunakan smartphone.",
  ],
  [
    "Apakah rekam medis dan resep obat terintegrasi langsung ke apotek?",
    "Ya. Begitu dokter menyelesaikan sesi konsultasi SOAP, resep elektronik otomatis tampil di workstation instalasi farmasi klinik. Apoteker langsung menyiapkan obat dan mencetak etiket aturan pakai tanpa perlu Anda menyerahkan kertas resep manual.",
  ],
  [
    "Berapa tarif konsultasi dokter di KlinikCare?",
    "Tarif konsultasi transparan tercantum pada direktori dokter di halaman ini (berkisar Rp 65.000 untuk Dokter Umum hingga Rp 135.000–Rp 150.000 untuk Dokter Spesialis). Biaya obat dihitung terpisah sesuai resep yang direkomendasikan dokter.",
  ],
  [
    "Kapan jam operasional pelayanan poliklinik rawat jalan?",
    "Poliklinik buka setiap Senin hingga Jumat pukul 08.00–21.00 WIB dan Sabtu pukul 08.00–14.00 WIB. Untuk kondisi gawat darurat, layanan IGD dan ambulans siaga 24 jam setiap hari.",
  ],
  [
    "Apakah data pasien dan transaksi pada website ini nyata?",
    "Tidak. Seluruh nama pasien, nomor rekam medis, keluhan klinis, resep obat, stok farmasi, dan transaksi dibuat khusus sebagai data simulasi aman untuk pengujian alur operasional produk KlinikCare.",
  ],
];

export function getDoctorImage(fullName: string, departmentName?: string): string {
  const name = fullName.toLowerCase();
  if (name.includes("hendra")) return "/images/doctor-hendra.jpg";
  if (name.includes("maya")) return "/images/doctor-maya.jpg";
  if (name.includes("fadhil") || name.includes("gigi")) return "/images/doctor-fadhil.jpg";
  if (name.includes("bambang") || name.includes("dalam")) return "/images/doctor-bambang.jpg";
  if (name.includes("nadia") || name.includes("safitri")) return "/images/doctor-nadia.jpg";
  if (departmentName?.toLowerCase().includes("anak")) return "/images/doctor-maya.jpg";
  if (departmentName?.toLowerCase().includes("gigi")) return "/images/doctor-fadhil.jpg";
  if (departmentName?.toLowerCase().includes("dalam")) return "/images/doctor-bambang.jpg";
  return "/images/doctor-hendra.jpg";
}
