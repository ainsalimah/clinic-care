"use client";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { fetchJson } from "@/lib/http/client";
export default function PasswordPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.password !== data.confirmPassword) { setError("Konfirmasi kata sandi tidak cocok."); return; }
    setBusy(true);
    try { await fetchJson("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); window.location.assign("/login?passwordChanged=1"); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal mengganti kata sandi."); setBusy(false); }
  }
  return <AppLayout activeNav="/account/password" breadcrumbTitle="Ganti Password"><div className="page"><h1 className="page-title">Ganti kata sandi</h1><p className="page-subtitle">Password awal wajib diganti. Setelah berhasil, semua sesi keluar dan kamu perlu masuk kembali.</p><section className="panel billing-panel"><form className="account-form" onSubmit={submit}>
    <label>Kata sandi saat ini<input name="currentPassword" type="password" required autoComplete="current-password" maxLength={72} /></label>
    <label>Kata sandi baru<input name="password" type="password" minLength={12} maxLength={72} required autoComplete="new-password" /><small>Minimal 12 karakter.</small></label>
    <label>Ulangi kata sandi baru<input name="confirmPassword" type="password" minLength={12} maxLength={72} required autoComplete="new-password" /></label>
    {error && <p role="alert" className="data-error">{error}</p>}<button className="btn-primary-action" disabled={busy}>{busy ? "Menyimpan…" : "Simpan kata sandi"}</button>
  </form></section></div></AppLayout>;
}
