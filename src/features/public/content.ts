export const weekdayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export const faqs = [
  [
    "Apakah pasien baru bisa membuat janji secara online?",
    "Bisa. Buat akun pasien di KlinikCare, lengkapi identitas dasar, lalu pilih poli, dokter, dan tanggal kunjungan yang Anda kehendaki.",
  ],
  [
    "Kapan nomor antrean fisik diterbitkan?",
    "Nomor antrean resmi diterbitkan saat Anda tiba di klinik dan melakukan check-in di meja resepsionis pada hari kunjungan, sehingga urutan pelayanan tetap tertib dan adil.",
  ],
  [
    "Bagaimana jika pasien lansia ingin datang langsung tanpa daftar online?",
    "Sangat diperbolehkan. Staf resepsionis kami siap membantu pendaftaran manual langsung di meja penerimaan tanpa perlu membawa atau menggunakan smartphone.",
  ],
  [
    "Apakah rekam medis dan resep obat terintegrasi?",
    "Ya. Setelah pemeriksaan oleh dokter, diagnosa dan catatan resep otomatis terhubung ke bagian instalasi farmasi klinik sehingga obat dapat segera disiapkan.",
  ],
  [
    "Kapan jam operasional pelayanan KlinikCare?",
    "Layanan rawat jalan kami buka setiap Senin hingga Jumat pukul 08.00–21.00 WIB dan Sabtu pukul 08.00–14.00 WIB. Hari Minggu dan libur nasional tutup.",
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
