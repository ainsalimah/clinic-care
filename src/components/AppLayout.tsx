"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Package,
  Pill,
  Stethoscope,
  Users,
} from "lucide-react";
import { canAccessPath, type AppRole } from "@/lib/access";

type Role = "Admin" | "Resepsionis" | "Dokter" | "Apoteker" | "Pasien";

const roleToEnum: Record<Role, "ADMIN" | "RECEPTIONIST" | "DOCTOR" | "PHARMACIST" | "PATIENT"> = {
  Admin: "ADMIN",
  Resepsionis: "RECEPTIONIST",
  Dokter: "DOCTOR",
  Apoteker: "PHARMACIST",
  Pasien: "PATIENT",
};

const enumToRole: Record<string, Role> = {
  ADMIN: "Admin",
  RECEPTIONIST: "Resepsionis",
  DOCTOR: "Dokter",
  PHARMACIST: "Apoteker",
  PATIENT: "Pasien",
};

type SessionProfile = { name: string; email: string; role: string };

// This cache is populated only after /api/auth/me succeeds. On the first
// hydration it is empty on both server and client; later SPA navigations can
// render the already-verified role without a blank sidebar.
let cachedSession: { role: Role; user: SessionProfile } | null = null;

interface AppLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
  breadcrumbTitle?: string;
}

export default function AppLayout({ children, activeNav, breadcrumbTitle }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Keep the initial SSR and browser render deterministic. Do not render a
  // fallback role because it can briefly expose another role's navigation.
  const [role, setRole] = useState<Role | null>(() => cachedSession?.role ?? null);
  const [currentUser, setCurrentUser] = useState<SessionProfile | null>(() => cachedSession?.user ?? null);

  useEffect(() => {
    if (cachedSession) return;
    fetch("/api/auth/me")
      .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setCurrentUser(data.user);
            const mapped = enumToRole[data.user.role];
            if (mapped) {
              cachedSession = { role: mapped, user: data.user };
              setRole(mapped);
            }
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    cachedSession = null;
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const menuByRole: Record<AppRole, { label: string; items: { href: string; label: string; icon: typeof LayoutDashboard }[] }[]> = {
    ADMIN: [
      { label: "Ringkasan", items: [{ href: "/app", label: "Dashboard", icon: LayoutDashboard }] },
      { label: "Pelayanan", items: [{ href: "/patients", label: "Data Pasien", icon: Users }, { href: "/queue", label: "Kunjungan & Antrean", icon: CalendarDays }] },
      { label: "Operasional", items: [{ href: "/medicines", label: "Obat & Stok", icon: Package }] },
      { label: "Administrasi", items: [{ href: "/admin/reports", label: "Laporan Operasional", icon: BarChart3 }, { href: "/admin/fees", label: "Tarif Konsultasi", icon: BarChart3 }, { href: "/admin/finance", label: "Pembayaran & Koreksi", icon: BarChart3 }] },
    ],
    RECEPTIONIST: [
      { label: "Ringkasan", items: [{ href: "/app", label: "Dashboard", icon: LayoutDashboard }] },
      { label: "Pendaftaran", items: [{ href: "/patients", label: "Cari & Daftar Pasien", icon: Users }, { href: "/appointments", label: "Kunjungan Online", icon: CalendarDays }, { href: "/queue", label: "Kunjungan & Antrean", icon: CalendarDays }] },
    ],
    DOCTOR: [
      { label: "Ringkasan", items: [{ href: "/app", label: "Dashboard", icon: LayoutDashboard }] },
      { label: "Praktik", items: [{ href: "/doctor", label: "Antrean Saya", icon: Stethoscope }, { href: "/records", label: "Rekam Medis", icon: ClipboardList }] },
    ],
    PHARMACIST: [
      { label: "Ringkasan", items: [{ href: "/app", label: "Dashboard", icon: LayoutDashboard }] },
      { label: "Farmasi", items: [{ href: "/pharmacy", label: "Resep Masuk", icon: Pill }, { href: "/medicines", label: "Obat & Stok", icon: Package }, { href: "/pharmacy/finance", label: "Pembayaran & Koreksi", icon: BarChart3 }] },
    ],
    PATIENT: [
      { label: "Ringkasan", items: [{ href: "/patient", label: "Portal Saya", icon: LayoutDashboard }] },
    ],
  };
  const navGroups = role ? [...menuByRole[roleToEnum[role]], { label: "Akun", items: [{ href: "/account/password", label: "Ganti Password", icon: Users }, ...(role === "Admin" ? [{ href: "/admin/patient-accounts", label: "Pemulihan Pasien", icon: Users }, { href: "/admin/staff", label: "Akun Staf", icon: Users }] : [])] }] : [];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link href={role === "Pasien" ? "/patient" : "/app"} style={{ textDecoration: "none" }}>
          <div className="brand">
            <span className="brand-mark">
              <HeartPulse size={21} />
            </span>
            <span>
              Klinik<span>Care</span>
            </span>
          </div>
        </Link>

        <nav>
          {role ? navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => canAccessPath(item.href, roleToEnum[role]));
            if (!visibleItems.length) return null;
            return <div className="nav-group" key={group.label}>
              <p className="sidebar-label">{group.label}</p>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav
                  ? activeNav === item.href
                  : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
                return <Link key={item.href} href={item.href} className={`nav-item ${isActive ? "active" : ""}`}>
                  <Icon size={18} /><span>{item.label}</span>
                </Link>;
              })}
            </div>;
          }) : <div className="sidebar-loading" aria-label="Memuat navigasi"><span /><span /><span /><span /><span /></div>}
        </nav>

        <div className="sidebar-foot">
          <div className="help">
            <Activity size={18} />
            <span>
              Layanan Pasien Terpadu
              <small>Inklusif Lansia & Umum</small>
            </span>
          </div>

          <div className="profile">
            <div className="avatar">
              {currentUser ? getInitials(currentUser.name) : "KP"}
            </div>
            <div>
              <b>{currentUser ? currentUser.name : "Pengguna Klinik"}</b>
              <small>{currentUser ? currentUser.role : "Memuat sesi..."}</small>
            </div>
            <button
              className="btn-logout"
              onClick={handleLogout}
              title="Keluar dari sistem"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div className="crumb">
            <span>KlinikCare</span>
            <ChevronRight size={14} />
            <b>{breadcrumbTitle || role || "Memuat..."}</b>
          </div>

          <div className="top-actions">
            <div className="topbar-context">
              <span className="topbar-context-dot" />
              <span>Sistem aktif</span>
            </div>
            <div className="topbar-user">
              <span className="topbar-user-avatar">{currentUser ? getInitials(currentUser.name) : "KP"}</span>
              <span><b>{currentUser?.name || "Pengguna Klinik"}</b><small>{currentUser?.role || "Memuat sesi..."}</small></span>
            </div>
            <button
              className="btn-topbar-logout"
              onClick={handleLogout}
              title="Keluar dari sistem"
              aria-label="Logout"
            >
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {role && <label className="mobile-navigation">Menu halaman<select value={activeNav || pathname} onChange={e => router.push(e.target.value)}><option value={activeNav || pathname} hidden>{breadcrumbTitle || "Pilih halaman"}</option>{navGroups.flatMap(group => group.items).map(item => <option key={item.href} value={item.href}>{item.label}</option>)}</select></label>}
        {children}
      </section>
    </main>
  );
}
