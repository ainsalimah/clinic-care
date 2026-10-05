"use client";

import { Quote } from "lucide-react";

export function TrustSection() {
  return (
    <section className="hero pad">
      <div className="wrap grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="eyebrow text-[#E8EEF2]">DIPERCAYA KELUARGA</p>
          <h2 className="font-extrabold text-2xl sm:text-3xl text-white mt-4 leading-tight">
            Perhatian Kecil, Arti Besar untuk Anda
          </h2>
          <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t border-white/20">
            <div>
              <p className="font-bold text-lg sm:text-xl text-white">10 Dokter</p>
              <p className="text-xs sm:text-sm text-white/80">Dokter Spesialis</p>
            </div>
            <div>
              <p className="font-bold text-lg sm:text-xl text-white">36.000+</p>
              <p className="text-xs sm:text-sm text-white/80">Kunjungan per Tahun</p>
            </div>
            <div>
              <p className="font-bold text-lg sm:text-xl text-white">15 Tahun</p>
              <p className="text-xs sm:text-sm text-white/80">Melayani Masyarakat</p>
            </div>
          </div>
        </div>

        <aside className="bg-white text-[#0B2D45] rounded-3xl p-8 shadow-xl">
          <Quote size={32} className="text-[#2F80C0]" />
          <p className="eyebrow mt-4 text-[#2F80C0]">CERITA KELUARGA</p>
          <blockquote className="mt-4 font-semibold text-lg text-[#0B2D45] leading-relaxed">
            “Pendaftaran tertata, petugas ramah, dan dokter memberi waktu untuk menjelaskan setiap langkah. Kami merasa benar-benar didampingi.”
          </blockquote>
          <p className="mt-4 text-[#4c6475] text-sm">
            — Rina Maheswari, Jakarta Selatan
          </p>
        </aside>
      </div>
    </section>
  );
}
