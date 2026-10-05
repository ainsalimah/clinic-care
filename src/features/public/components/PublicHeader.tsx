"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Plus, X } from "lucide-react";

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="canva-header sticky top-0 z-50 border-b border-[#E8EEF2] bg-white text-[#0B2D45]">
      <div className="wrap flex items-center justify-between gap-4 px-5 py-4">
        <Link href="#beranda" aria-label="Beranda RS Cakrawala Medika" className="flex items-center gap-3">
          <span className="rounded-xl bg-[#0B2D45] p-2 text-white" aria-hidden="true">
            <Plus size={20} strokeWidth={2.6} />
          </span>
          <span className="font-extrabold text-[#0B2D45] text-lg sm:text-xl tracking-tight">
            RS Cakrawala Medika
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden lg:flex items-center gap-6">
          <a href="#beranda" className="canva-nav-link font-semibold text-[15px]">Beranda</a>
          <a href="#layanan" className="canva-nav-link font-semibold text-[15px]">Layanan</a>
          <a href="#fasilitas" className="canva-nav-link font-semibold text-[15px]">Fasilitas</a>
          <a href="#dokter" className="canva-nav-link font-semibold text-[15px]">Dokter</a>
          <a href="#tentang" className="canva-nav-link font-semibold text-[15px]">Tentang Kami</a>
          <a href="#kontak" className="canva-nav-link font-semibold text-[15px]">Kontak</a>
          <a href="#demo" className="btn outline-btn font-bold text-[14px] !py-2.5 !px-4">Mode Demo</a>
          <a href="#janji" className="btn text-white font-bold text-[15px] !py-2.5 !px-5">Buat Janji</a>
          <Link href="/login" className="font-semibold text-[15px] text-[#0B2D45] hover:text-[#2F80C0] ml-2">Masuk</Link>
        </nav>

        <button
          type="button"
          className="lg:hidden p-2 rounded-lg text-[#0B2D45] hover:bg-[#E8EEF2]"
          aria-label="Buka atau tutup navigasi"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <nav aria-label="Navigasi mobile" className="px-5 pb-5 lg:hidden flex flex-col gap-3 border-t border-[#E8EEF2] bg-white pt-4">
          <a href="#beranda" onClick={() => setMenuOpen(false)} className="font-semibold text-base py-1">Beranda</a>
          <a href="#layanan" onClick={() => setMenuOpen(false)} className="font-semibold text-base py-1">Layanan</a>
          <a href="#fasilitas" onClick={() => setMenuOpen(false)} className="font-semibold text-base py-1">Fasilitas</a>
          <a href="#dokter" onClick={() => setMenuOpen(false)} className="font-semibold text-base py-1">Dokter</a>
          <a href="#tentang" onClick={() => setMenuOpen(false)} className="font-semibold text-base py-1">Tentang Kami</a>
          <a href="#kontak" onClick={() => setMenuOpen(false)} className="font-semibold text-base py-1">Kontak</a>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E8EEF2]">
            <a href="#janji" onClick={() => setMenuOpen(false)} className="btn text-white w-full text-center">Buat Janji</a>
            <a href="#demo" onClick={() => setMenuOpen(false)} className="btn outline-btn w-full text-center">Coba Demo 4 Role</a>
            <Link href="/login" onClick={() => setMenuOpen(false)} className="btn outline-btn w-full text-center">Masuk Akun</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
