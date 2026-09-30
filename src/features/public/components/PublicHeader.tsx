"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ChevronRight,
  HeartPulse,
  Menu,
  PhoneCall,
  Sparkles,
  User,
  X,
} from "lucide-react";

const navLinks = [
  { href: "#demo", label: "Demo 4-Role" },
  { href: "#poli", label: "Layanan Poli" },
  { href: "#dokter", label: "Dokter & Jadwal" },
  { href: "#alur", label: "Alur Pelayanan" },
  { href: "#faq", label: "FAQ" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`kc-header ${scrolled ? "kc-header-scrolled" : ""}`}>
      {/* Top micro-announcement banner */}
      <div className="kc-top-strip">
        <div className="kc-shell kc-top-strip-inner">
          <div className="kc-status-live">
            <span className="kc-live-beacon">
              <span className="kc-beacon-ring" />
              <span className="kc-beacon-dot" />
            </span>
            <span>Klinik Buka Hari Ini · 08.00 – 21.00 WIB</span>
          </div>
          <div className="kc-top-strip-right">
            <span className="kc-top-tag">Layanan Rawat Jalan & Farmasi Terpadu</span>
            <span className="kc-strip-sep" />
            <a href="tel:02287654321" className="kc-top-phone">
              <PhoneCall size={12} />
              <span>(022) 8765-4321</span>
            </a>
          </div>
        </div>
      </div>

      <div className="kc-header-inner">
        <Link href="/" className="kc-brand" aria-label="KlinikCare, kembali ke beranda">
          <span className="kc-brand-mark">
            <HeartPulse size={22} strokeWidth={2.4} />
          </span>
          <span className="kc-brand-text">
            <span className="kc-brand-title">
              <b>Klinik</b>
              <b className="kc-brand-accent">Care</b>
            </span>
            <small>Klinik Pratama Terpadu</small>
          </span>
        </Link>

        <nav className="kc-nav" aria-label="Navigasi utama">
          {navLinks.map((item) => (
            <a key={item.href} href={item.href} className="kc-nav-link">
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="kc-header-actions">
          <Link href="/login" className="kc-login-link">
            <User size={15} />
            <span>Masuk</span>
          </Link>
          <Link href="/login#demo" className="kc-demo-pill-btn">
            <Sparkles size={14} />
            <span>Demo 4-Role</span>
          </Link>
          <Link href="/register" className="kc-btn-primary kc-btn-header">
            <CalendarCheck size={16} />
            <span>Daftar Janji</span>
          </Link>
        </div>

        <button
          type="button"
          className="kc-menu-button"
          aria-label={open ? "Tutup navigasi" : "Buka navigasi"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {open && (
        <div className="kc-mobile-backdrop" onClick={() => setOpen(false)}>
          <nav
            className="kc-mobile-nav"
            aria-label="Navigasi ponsel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="kc-mobile-nav-head">
              <div className="kc-mobile-status">
                <span className="kc-beacon-dot" />
                <span>Pelayanan Aktif (08.00–21.00 WIB)</span>
              </div>
              <button
                type="button"
                className="kc-mobile-close"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="kc-mobile-links">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="kc-mobile-item"
                  onClick={() => setOpen(false)}
                >
                  <span>{item.label}</span>
                  <ChevronRight size={16} />
                </a>
              ))}
            </div>

            <div className="kc-mobile-actions">
              <Link
                href="/login#demo"
                className="kc-btn-secondary kc-btn-block"
                onClick={() => setOpen(false)}
              >
                <Sparkles size={16} />
                <span>Coba Demo 4 Role</span>
              </Link>
              <Link
                href="/register"
                className="kc-btn-primary kc-btn-block"
                onClick={() => setOpen(false)}
              >
                <CalendarCheck size={16} />
                <span>Daftar Janji Temu</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/login"
                className="kc-mobile-login"
                onClick={() => setOpen(false)}
              >
                <User size={15} />
                <span>Masuk Akun Pasien / Staf</span>
              </Link>
            </div>

            <div className="kc-mobile-foot">
              <PhoneCall size={14} />
              <span>Bantuan Langsung: (022) 8765-4321</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
