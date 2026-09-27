"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, HeartPulse, Menu, X } from "lucide-react";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#poli", label: "Poli & Layanan" },
    { href: "#tentang", label: "Pengantar Klinik" },
    { href: "#dokter", label: "Jadwal Dokter" },
    { href: "#alur", label: "Alur Kunjungan" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#e5ede7] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
          aria-label="KlinikCare Beranda"
        >
          <span className="grid size-10 place-items-center rounded-lg bg-[#145c4d] text-white transition group-hover:bg-[#0e483c]">
            <HeartPulse size={20} strokeWidth={2.2} />
          </span>
          <span className="leading-tight">
            <span className="block font-jakarta text-xl font-extrabold tracking-tight text-[#143c34]">
              Klinik<span className="text-[#187560]">Care</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#637d72]">
              Rawat Jalan & Farmasi
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Navigasi Utama" className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#4a655b] transition hover:text-[#187560] focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-[#1f4b3e] transition hover:bg-[#f0f6f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#145c4d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0e483c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560] focus-visible:ring-offset-2"
          >
            Daftar Janji <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="grid size-11 place-items-center rounded-lg border border-[#d8e4dc] text-[#1c4b3e] transition hover:bg-[#f4f8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560] md:hidden"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navigasi Ponsel"
          className="border-t border-[#e5ede7] bg-white px-5 py-5 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3.5 py-3 text-base font-medium text-[#2f5549] transition hover:bg-[#f2f7f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#e5ede7] pt-4">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-lg border border-[#d6e3da] py-2.5 text-center text-sm font-semibold text-[#1f4b3e] transition hover:bg-[#f4f8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-lg bg-[#145c4d] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0e483c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
              >
                Daftar Janji
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
