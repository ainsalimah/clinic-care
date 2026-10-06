import { CalendarDays, Clock, DoorOpen, FileText, HeartHandshake, Pill, ShieldCheck, Stethoscope, Volume2 } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: CalendarDays,
    title: "Daftar & Pilih Jadwal",
    description: "Pilih poli, dokter, dan tanggal periksa secara online atau daftar langsung di meja penerimaan.",
    detail: "Online / Walk-in",
    duration: "2-3 menit",
  },
  {
    step: "02",
    icon: DoorOpen,
    title: "Check-in Kedatangan",
    description: "Petugas memverifikasi identitas Anda dan menerbitkan nomor antrean untuk poli yang dituju.",
    detail: "Meja penerimaan",
    duration: "1 menit",
  },
  {
    step: "03",
    icon: Volume2,
    title: "Tunggu Panggilan Antrean",
    description: "Nomor antrean dipanggil menuju ruang dokter. Silakan perhatikan display dan pengumuman di ruang tunggu.",
    detail: "Ruang tunggu",
    duration: "Sesuai antrean",
  },
  {
    step: "04",
    icon: Stethoscope,
    title: "Pemeriksaan Dokter",
    description: "Dokter melakukan pemeriksaan dan menjelaskan rencana perawatan sesuai kebutuhan Anda.",
    detail: "Ruang konsultasi",
    duration: "15-20 menit",
  },
  {
    step: "05",
    icon: Pill,
    title: "Obat & Administrasi",
    description: "Bila ada resep, ambil obat di farmasi dan selesaikan administrasi kunjungan di kasir.",
    detail: "Farmasi & kasir",
    duration: "5-10 menit",
  },
];

export function PatientGuideSection() {
  return (
    <section id="panduan" className="pad mesh" aria-labelledby="guide-title">
      <div className="wrap">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3 text-[#2F80C0]">PANDUAN KUNJUNGAN</p>
          <h2 id="guide-title" className="text-[#0B2D45] font-extrabold text-2xl sm:text-3xl">
            Alur Pelayanan Pasien
          </h2>
          <p className="mt-4 text-[#315066] text-base leading-relaxed">
            Ketahui langkah kunjungan Anda sejak mendaftar hingga menyelesaikan administrasi dengan tenang.
          </p>
        </div>

        <ol className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map(({ step, icon: Icon, title, description, detail, duration }) => (
            <li key={step} className="rounded-3xl border border-[#d5e2eb] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-extrabold text-[#2F80C0]">{step}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8EEF2] text-[#0B2D45]">
                  <Icon size={20} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#2F80C0]">{detail}</p>
              <h3 className="mt-2 font-bold text-lg leading-snug text-[#0B2D45]">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#315066]">{description}</p>
              <p className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-[#4c6475]">
                <Clock size={14} aria-hidden="true" />
                {duration}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <aside className="flex gap-4 rounded-3xl border border-[#bcdcf2] bg-[#edf7fd] p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2F80C0] text-white">
              <HeartHandshake size={22} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-[#0B2D45]">Pendampingan Lansia & Pasien Prioritas</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#315066]">Staf kami siap membantu pendaftaran manual dan check-in. Anda tidak wajib menggunakan smartphone.</p>
            </div>
          </aside>

          <aside className="flex gap-4 rounded-3xl border border-[#d5e2eb] bg-white p-6 shadow-sm">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8EEF2] text-[#0B2D45]">
              <FileText size={22} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-[#0B2D45]">Yang Perlu Dibawa</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#315066]">Bawa KTP, kartu pasien bila sudah terdaftar, kartu BPJS atau asuransi, serta surat rujukan bila diperlukan.</p>
              <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#0B2D45]">
                <ShieldCheck size={16} aria-hidden="true" />
                Datang 15 menit sebelum jadwal.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
