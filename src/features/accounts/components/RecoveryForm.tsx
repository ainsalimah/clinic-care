"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, HeartPulse, KeyRound, LockKeyhole, Mail, Send } from "lucide-react";
import { fetchJson } from "@/lib/http/client";

export default function RecoveryForm({ reset = false }: { reset?: boolean }) {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (reset) {
      setToken(new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [reset]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (reset && data.password !== data.confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setBusy(true);
    try {
      const result = await fetchJson<{ message?: string }>(`/api/auth/${reset ? "reset-password" : "forgot-password"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token }),
      });
      if (reset) {
        window.location.assign("/login?passwordChanged=1");
        return;
      }
      setMessage(result.message ?? "Permintaan diterima.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Permintaan gagal.");
    } finally {
      setBusy(false);
    }
  }

  const title = reset ? "Atur Kata Sandi Baru" : "Lupa Kata Sandi?";
  const description = reset
    ? "Buat kata sandi baru untuk mengamankan akun Anda. Tautan ini berlaku satu kali selama 30 menit."
    : "Masukkan email yang terdaftar. Kami akan mengirimkan tautan aman untuk mengatur ulang kata sandi Anda.";

  return (
    <main className="login-wrapper">
      <section className="login-container recovery-card" aria-labelledby="recovery-title">
        <Link href="/login" className="recovery-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Kembali ke halaman masuk
        </Link>

        <div className="login-header recovery-header">
          <span className="recovery-icon" aria-hidden="true">
            {reset ? <KeyRound size={24} /> : <HeartPulse size={24} />}
          </span>
          <h1 id="recovery-title">{title}</h1>
          <p>{description}</p>
        </div>

        <form className="login-form" onSubmit={submit}>
          {reset ? (
            <>
              <label className="form-group" htmlFor="new-password">
                <span>Kata Sandi Baru</span>
                <span className="input-affix">
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input id="new-password" name="password" type="password" required minLength={12} maxLength={72} autoComplete="new-password" />
                </span>
              </label>
              <label className="form-group" htmlFor="confirm-password">
                <span>Ulangi Kata Sandi Baru</span>
                <span className="input-affix">
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input id="confirm-password" name="confirmPassword" type="password" required minLength={12} maxLength={72} autoComplete="new-password" />
                </span>
              </label>
              {!token && <p role="alert" className="login-alert">Buka tautan lengkap dari email untuk melanjutkan.</p>}
            </>
          ) : (
            <label className="form-group" htmlFor="recovery-email">
              <span>Email Akun</span>
              <span className="input-affix">
                <Mail size={18} aria-hidden="true" />
                <input id="recovery-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="nama@email.com" />
              </span>
            </label>
          )}

          {error && <p role="alert" className="login-alert">{error}</p>}
          {message && <p role="status" className="recovery-success"><CheckCircle2 size={18} aria-hidden="true" />{message}</p>}
          <button className="btn-submit" disabled={busy || (reset && !token)}>
            {reset ? <LockKeyhole size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
            {busy ? "Memproses..." : reset ? "Simpan Kata Sandi Baru" : "Kirim Tautan Pemulihan"}
          </button>
        </form>

        {!reset && (
          <aside className="recovery-help">
            <h2>Tidak menerima email atau lupa alamat akun?</h2>
            <p>Hubungi petugas klinik. Siapkan NIK, tanggal lahir, dan nomor telepon untuk verifikasi akun Anda.</p>
          </aside>
        )}
      </section>
    </main>
  );
}
