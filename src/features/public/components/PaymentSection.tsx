import { BadgeCheck, CreditCard, FileCheck2, ShieldCheck } from "lucide-react";

const paymentOptions = [
  {
    icon: ShieldCheck,
    title: "BPJS Kesehatan",
    description: "Siapkan kartu BPJS, KTP, serta surat rujukan yang masih berlaku bila layanan Anda memerlukannya.",
  },
  {
    icon: BadgeCheck,
    title: "Asuransi Mitra",
    description: "Bawa kartu asuransi dan hubungi tim pendaftaran untuk memastikan manfaat serta penjaminan sebelum berkunjung.",
  },
  {
    icon: CreditCard,
    title: "Pembayaran Umum",
    description: "Pembayaran mandiri dapat dilakukan di kasir setelah layanan. Tim kami membantu menjelaskan estimasi biaya administrasi.",
  },
];

export function PaymentSection() {
  return (
    <section id="pembiayaan" className="pad mesh" aria-labelledby="payment-title">
      <div className="wrap">
        <p className="eyebrow mb-3 text-[#2F80C0]">PEMBIAYAAN KUNJUNGAN</p>
        <h2 id="payment-title" className="text-[#0B2D45] font-extrabold text-2xl sm:text-3xl">
          Siapkan Pembiayaan Sebelum Berkunjung
        </h2>
        <p className="mt-4 max-w-2xl text-[#315066] text-base leading-relaxed">
          Pastikan penjaminan sesuai sebelum datang agar proses pendaftaran berjalan lebih lancar.
        </p>

        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {paymentOptions.map(({ icon: Icon, title, description }) => (
            <article key={title} className="bg-white rounded-3xl p-7 shadow-sm border border-[#d5e2eb]">
              <span className="w-11 h-11 rounded-2xl bg-[#E8EEF2] text-[#0B2D45] flex items-center justify-center">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-bold text-xl text-[#0B2D45]">{title}</h3>
              <p className="mt-3 text-[#315066] text-sm leading-relaxed">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-[#0B2D45] px-6 py-5 text-white">
          <FileCheck2 size={22} aria-hidden="true" className="shrink-0" />
          <p className="text-sm sm:text-base">Butuh verifikasi penjaminan? Hubungi pendaftaran sebelum memilih jadwal kunjungan.</p>
          <a href="tel:+62215557788" className="btn white-btn !py-2.5 !text-sm sm:ml-auto">Hubungi Pendaftaran</a>
        </div>
      </div>
    </section>
  );
}
