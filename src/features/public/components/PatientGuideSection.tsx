import {
  CalendarDays,
  Clock,
  DoorOpen,
  HeartHandshake,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Volume2,
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: CalendarDays,
    title: "Daftar & Pilih Jadwal",
    desc: "Pasien memilih poli, dokter spesialis, dan tanggal periksa secara online atau mendaftar langsung di meja klinik.",
    tag: "Online / Walk-in",
    duration: "2-3 Menit",
  },
  {
    step: "02",
    icon: DoorOpen,
    title: "Check-in Kedatangan",
    desc: "Petugas resepsionis memverifikasi identitas pasien via NIK atau No. RM dan menerbitkan nomor antrean resmi.",
    tag: "Meja Resepsionis",
    duration: "1 Menit",
  },
  {
    step: "03",
    icon: Volume2,
    title: "Panggilan Antrean Suara",
    desc: "Sistem audio otomatis memanggil nomor antrean menuju ruangan dokter spesialis yang sedang bertugas.",
    tag: "Speaker Multi-Ruang",
    duration: "Real-time",
  },
  {
    step: "04",
    icon: Stethoscope,
    title: "Pemeriksaan Dokter (SOAP)",
    desc: "Dokter memeriksa fisik, mencatat anamnesis terstruktur, diagnosa ICD-10, lalu mengirimkan e-resep ke farmasi.",
    tag: "Ruang Konsultasi",
    duration: "15-20 Menit",
  },
  {
    step: "05",
    icon: Pill,
    title: "Penyerahan Obat & Kasir",
    desc: "Apoteker meracik obat, menempelkan etiket dosis pemakaian, dan menyelesaikan administrasi tagihan terpadu.",
    tag: "Instalasi Farmasi",
    duration: "5-10 Menit",
  },
];

export function PatientGuideSection() {
  return (
    <section className="kc-journey-section" id="alur">
      <div className="kc-shell">
        <div className="kc-section-head-center kc-reveal">
          <p className="kc-eyebrow">
            <Sparkles size={13} />
            <span>Alur Pelayanan Pasien</span>
          </p>
          <h2 className="kc-heading">
            Dari kedatangan hingga obat di tangan,<br />
            <em>seluruh alur terstruktur dengan tenang.</em>
          </h2>
          <p className="kc-lead-p-center">
            Setiap tahap kunjungan dirancang terhubung sehingga pasien memahami urutan layanan dari
            langkah pertama saat tiba hingga obat dan edukasi diserahkan.
          </p>
        </div>

        {/* Step Track Cards */}
        <div className="kc-journey-track kc-reveal">
          <div className="kc-steps-grid">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.step} className="kc-step-card">
                  <div className="kc-step-top">
                    <span className="kc-step-num">{item.step}</span>
                    <div className="kc-step-icon">
                      <Icon size={20} />
                    </div>
                  </div>

                  <div className="kc-step-meta-row">
                    <span className="kc-step-tag">{item.tag}</span>
                    <span className="kc-step-duration">
                      <Clock size={11} />
                      <span>{item.duration}</span>
                    </span>
                  </div>

                  <h3 className="kc-step-title">{item.title}</h3>
                  <p className="kc-step-desc">{item.desc}</p>
                </article>
              );
            })}
          </div>
        </div>

        {/* Inclusive Reassurance Box */}
        <div className="kc-journey-notice kc-reveal">
          <div className="kc-notice-icon">
            <HeartHandshake size={26} />
          </div>
          <div className="kc-notice-content">
            <div className="kc-notice-head-row">
              <b>Pendampingan Khusus Pasien Lansia & Prioritas</b>
              <span className="kc-priority-pill">
                <ShieldCheck size={13} />
                <span>Tanpa Wajib Smartphone</span>
              </span>
            </div>
            <p>
              Staf resepsionis kami siap mendampingi pendaftaran manual langsung di meja penerimaan,
              membacakan nomor antrean fisik, dan memfasilitasi keluarga tanpa hambatan teknologi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
