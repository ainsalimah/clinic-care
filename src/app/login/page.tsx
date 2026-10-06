"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HeartPulse,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCallback = searchParams.get("callbackUrl");
  const callbackUrl = requestedCallback?.startsWith("/") && !requestedCallback.startsWith("//") ? requestedCallback : "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Gagal masuk. Periksa email & kata sandi.");
        setLoading(false);
        return;
      }

      if (data.user?.role) {
        const roleNameMap: Record<string, string> = {
          ADMIN: "Admin",
          RECEPTIONIST: "Resepsionis",
          DOCTOR: "Dokter",
          PHARMACIST: "Apoteker",
          PATIENT: "Pasien",
        };
        const roleName = roleNameMap[data.user.role];
        if (roleName) {
          localStorage.setItem("cliniccare_role", roleName);
          localStorage.setItem("cliniccare_user", JSON.stringify(data.user));
          document.cookie = `cliniccare_role_name=${encodeURIComponent(roleName)}; path=/; max-age=604800; SameSite=Lax`;
        }
      }

      router.push(callbackUrl || (data.user?.role === "PATIENT" ? "/patient" : "/app"));
      router.refresh();
    } catch {
      setErrorMessage("Terjadi gangguan jaringan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Header Branding */}
        <div className="login-header">
          <div className="login-brand">
            <span className="brand-mark">
              <HeartPulse size={24} />
            </span>
            <span>
              Klinik<span>Care</span>
            </span>
          </div>
          <h1>Masuk ke Sistem</h1>
          <p>Sistem Manajemen Terpadu Pelayanan Medis & Farmasi</p>
        </div>

        {/* Error Alert */}
        {searchParams.get("passwordChanged") === "1" && <p role="status" className="portal-notice">Kata sandi berhasil diperbarui. Silakan masuk kembali.</p>}
        {errorMessage && (
          <div className="login-alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Manual Login Form */}
        <form onSubmit={handleManualLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Pengguna</label>
            <div className="input-affix">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                required
                placeholder="nama@klinikcare.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Kata Sandi</label>
            <div className="input-affix">
              <Lock size={18} />
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="auth-existing"><Link href="/forgot-password">Lupa kata sandi?</Link></p>
        <p className="auth-existing">Belum punya akun pasien? <Link href="/register">Daftar di sini</Link></p>
        <p className="auth-existing">Ingin melihat portofolio? <Link href="/#demo">Coba demo berdasarkan peran</Link></p>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="login-wrapper">
          <div className="login-container" style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: "#72828c", fontSize: "14px" }}>Memuat halaman masuk KlinikCare...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
