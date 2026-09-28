"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, HeartPulse, Menu, X } from "lucide-react";

const navLinks = [
  { href: "#demo", label: "Coba Demo" },
  { href: "#poli", label: "Layanan" },
  { href: "#dokter", label: "Dokter" },
  { href: "#alur", label: "Alur Pasien" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  return <header className="kc-header">
    <div className="kc-header-inner">
      <Link href="/" className="kc-brand" aria-label="KlinikCare, kembali ke beranda">
        <span className="kc-brand-mark"><HeartPulse size={20} strokeWidth={2.2} /></span>
        <span><b>KlinikCare</b><small>Rawat jalan & farmasi</small></span>
      </Link>
      <nav className="kc-nav" aria-label="Navigasi utama">
        {navLinks.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}
      </nav>
      <div className="kc-header-actions">
        <Link href="/login" className="kc-login-link">Masuk</Link>
        <Link href="/login#demo" className="kc-button kc-button-small">Coba demo <ArrowUpRight size={15} /></Link>
      </div>
      <button type="button" className="kc-menu-button" aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
    {open && <nav className="kc-mobile-nav" aria-label="Navigasi ponsel">
      {navLinks.map(item => <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
      <div><Link href="/login" onClick={() => setOpen(false)}>Masuk</Link><Link href="/register" className="kc-button" onClick={() => setOpen(false)}>Buat janji</Link></div>
    </nav>}
  </header>;
}
