import { ArrowRight, CheckCircle2, ClipboardCheck, Stethoscope, Pill } from "lucide-react";

export function PatientGuideSection() {
  const steps = [
    {
      num: "01",
      icon: ClipboardCheck,
      title: "Registrasi Kunjungan",
      desc: "Pilih tanggal dan dokter melalui formulir online dari rumah, atau langsung registrasi di meja resepsionis klinik.",
    },
    {
      num: "02",
      icon: CheckCircle2,
      title: "Check-in di Meja Resepsionis",
      desc: "Konfirmasi kedatangan pada hari pemeriksaan. Petugas memverifikasi data dan menerbitkan nomor antrean resmi.",
    },
    {
      num: "03",
      icon: Stethoscope,
      title: "Konsultasi Medis",
      desc: "Dokter memeriksa kondisi Anda secara mendalam. Diagnosa dan resep tercatat terpusat dalam rekam medis digital.",
    },
    {
      num: "04",
      icon: Pill,
      title: "Farmasi & Resep Obat",
      desc: "Instalasi farmasi menerima resep langsung dari ruang dokter. Obat disiapkan dengan instruksi penggunaan yang jelas.",
    },
  ];

  return (
    <section className="border-b border-[#e2eae4] bg-[#f9fbf9] py-16 sm:py-20 lg:py-24" id="alur">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#187560]">
            Alur Pelayanan Pasien
          </p>
          <h2 className="mt-3 font-jakarta text-2xl font-extrabold tracking-tight text-[#143c34] sm:text-3xl lg:text-4xl">
            Langkah teratur untuk kenyamanan periksa Anda
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#4d6b60] sm:text-base">
            Kami memastikan setiap tahap kunjungan transparan, mudah dipahami, dan mengutamakan ketepatan waktu.
          </p>
        </div>

        {/* Minimal 4-step sequence */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative flex flex-col justify-between border-t border-[#d8e4dc] pt-6"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-jakarta text-3xl font-extrabold tracking-tight text-[#187560]">
                      {step.num}
                    </span>
                    <span className="grid size-9 place-items-center rounded-lg bg-[#eaf3ee] text-[#187560]">
                      <Icon size={18} />
                    </span>
                  </div>

                  <h3 className="mt-4 font-jakarta text-base font-bold text-[#143c34]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#516f64] sm:text-sm">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#e2ece5] pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-[#5a766c] sm:text-sm">
            Memiliki pertanyaan mengenai persiapan sebelum berobat?
          </p>
          <a
            href="#faq"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#187560] transition hover:text-[#0e483c]"
          >
            Lihat Tanya Jawab Umum <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </section>
  );
}
