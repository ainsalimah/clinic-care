import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck } from "lucide-react";

export function AppointmentBanner() {
  return (
    <section className="bg-[#103b32] py-16 text-white sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#79cbb6]">
              <CalendarDays size={15} />
              Layanan Pendaftaran Rawat Jalan
            </div>
            <h2 className="mt-3 font-jakarta text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Rencanakan konsultasi kesehatan Anda dan keluarga hari ini.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#b4d4ca] sm:text-base">
              Pilih dokter spesialis sesuai kebutuhan dan tentukan jadwal praktik yang paling sesuai.
              Data rekam medis Anda tersimpan rapi dan aman dalam sistem terpadu.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-bold text-[#103b32] shadow-sm transition hover:bg-[#edf5f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#103b32]"
            >
              Buat Janji Online <ArrowRight size={15} />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[#3b665c] px-6 text-sm font-semibold text-white transition hover:border-[#679b8f] hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Masuk Akun
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-[#1e5247] pt-6 text-xs text-[#8ab8aa]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#56be9f]" />
            KlinikCare mengedepankan keamanan data identitas dan kerahasiaan rekam medis pasien.
          </span>
        </div>
      </div>
    </section>
  );
}
