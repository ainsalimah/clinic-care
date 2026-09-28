import { ClipboardCheck, DoorOpen, Pill, ReceiptText, Stethoscope } from "lucide-react";

const steps = [
  { icon: ClipboardCheck, title: "Daftar & pilih jadwal", desc: "Daftar online atau datang langsung ke meja resepsionis." },
  { icon: DoorOpen, title: "Check-in kedatangan", desc: "Petugas memverifikasi data dan menerbitkan antrean." },
  { icon: Stethoscope, title: "Pemeriksaan dokter", desc: "Keluhan, diagnosis, dan resep dicatat secara terpadu." },
  { icon: Pill, title: "Obat disiapkan", desc: "Apoteker menerima resep langsung dari ruang dokter." },
  { icon: ReceiptText, title: "Bayar & selesai", desc: "Biaya konsultasi dan obat dirinci dalam satu tagihan." },
];

export function PatientGuideSection() {
  return <section className="kc-journey kc-section" id="alur">
    <div className="kc-shell">
      <div className="kc-section-intro kc-reveal"><p className="kc-eyebrow">Alur kunjungan pasien</p><h2 className="kc-heading">Dari datang sampai pulang, semuanya jelas.</h2><p>Setiap tahap terhubung sehingga pasien tahu apa yang sedang berlangsung dan apa yang perlu dilakukan berikutnya.</p></div>
      <div className="kc-journey-line">
        {steps.map((step, index) => { const Icon=step.icon; return <article key={step.title} className="kc-journey-step kc-card-motion"><div className="kc-step-marker"><span>{String(index + 1).padStart(2,"0")}</span><i><Icon size={20} /></i></div><h3>{step.title}</h3><p>{step.desc}</p></article>; })}
      </div>
    </div>
  </section>;
}
