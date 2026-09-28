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

const isRole = (role: Role): role is Role => Boolean(roleToEnum[role]);

// In-memory singletons to ensure zero-flash instant rendering during SPA client navigation
let cachedRole: Role | null = null;
let cachedUser: { name: string; email: string; role: string } | null = null;

function getInitialRole(): Role {
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/patient")) {
    cachedRole = "Pasien";
    return "Pasien";
  }
  if (cachedRole) return cachedRole;
  if (typeof window !== "undefined") {
    // 1. Try reading role cookie
    const match = document.cookie.match(/cliniccare_role_name=([^;]+)/);
    if (match) {
      const cookieVal = decodeURIComponent(match[1]) as Role;
      if (cookieVal && isRole(cookieVal)) {
        cachedRole = cookieVal;
        return cookieVal;
      }
    }
    // 2. Try reading localStorage
    const saved = localStorage.getItem("cliniccare_role") as Role | null;
    if (saved && isRole(saved)) {
      cachedRole = saved;
      return saved;
    }
  }
  return "Resepsionis";
}

function getInitialUser(): { name: string; email: string; role: string } | null {
  if (cachedUser) return cachedUser;
  if (typeof window !== "undefined") {
    try {
      const savedUser = localStorage.getItem("cliniccare_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        cachedUser = parsed;
        return parsed;
      }
    } catch {}
  }
  return null;
}

interface AppLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
  breadcrumbTitle?: string;
}

export default function AppLayout({ children, activeNav, breadcrumbTitle }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<Role>(getInitialRole);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(getInitialUser);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          cachedUser = data.user;
          setCurrentUser(data.user);
          const mapped = enumToRole[data.user.role];
          if (mapped) {
            cachedRole = mapped;
            setRole(mapped);
            if (typeof window !== "undefined") {
              localStorage.setItem("cliniccare_role", mapped);
              localStorage.setItem("cliniccare_user", JSON.stringify(data.user));
              document.cookie = `cliniccare_role_name=${encodeURIComponent(mapped)}; path=/; max-age=604800; SameSite=Lax`;
            }
          }
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    cachedRole = null;
    cachedUser = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("cliniccare_role");
      localStorage.removeItem("cliniccare_user");
      document.cookie = "cliniccare_role_name=; path=/; max-age=0";
    }
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
  const navGroups = [...menuByRole[roleToEnum[role]], { label: "Akun", items: [{ href: "/account/password", label: "Ganti Password", icon: Users }, ...(role === "Admin" ? [{ href: "/admin/patient-accounts", label: "Pemulihan Pasien", icon: Users }, { href: "/admin/staff", label: "Akun Staf", icon: Users }] : [])] }];

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
          {navGroups.map((group) => {
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
          })}
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
              <small>{currentUser ? currentUser.role : role}</small>
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
            <b>{breadcrumbTitle || role}</b>
          </div>

          <div className="top-actions">
            <div className="topbar-context">
              <span className="topbar-context-dot" />
              <span>Sistem aktif</span>
            </div>
            <div className="topbar-user">
              <span className="topbar-user-avatar">{currentUser ? getInitials(currentUser.name) : "KP"}</span>
              <span><b>{currentUser?.name || "Pengguna Klinik"}</b><small>{currentUser?.role || role}</small></span>
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

        <label className="mobile-navigation">Menu halaman<select value={activeNav || pathname} onChange={e => router.push(e.target.value)}><option value={activeNav || pathname} hidden>{breadcrumbTitle || "Pilih halaman"}</option>{navGroups.flatMap(group => group.items).map(item => <option key={item.href} value={item.href}>{item.label}</option>)}</select></label>
        {children}
      </section>
    </main>
  );
}
