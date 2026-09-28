"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJson } from "@/lib/http/client";
export default function RecoveryForm({ reset = false }: { reset?: boolean }) {
  const [token, setToken] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [message, setMessage] = useState("");
  useEffect(() => { if (reset) { setToken(new URLSearchParams(window.location.hash.slice(1)).get("token") ?? ""); window.history.replaceState(null, "", window.location.pathname); } }, [reset]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage(""); const data = Object.fromEntries(new FormData(event.currentTarget));
    if (reset && data.password !== data.confirmPassword) { setError("Konfirmasi kata sandi tidak cocok."); return; }
    setBusy(true);
    try { const result = await fetchJson<{ message?: string }>(`/api/auth/${reset ? "reset-password" : "forgot-password"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, token }) }); if (reset) { window.location.assign("/login?passwordChanged=1"); return; } setMessage(result.message ?? "Permintaan diterima."); }
    catch (err) { setError(err instanceof Error ? err.message : "Permintaan gagal."); }
    finally { setBusy(false); }
  }
  return <main className="recovery-page"><section className="panel billing-panel"><Link href="/login">← Kembali ke halaman masuk</Link><h1>{reset ? "Atur kata sandi baru" : "Lupa kata sandi"}</h1><p>{reset ? "Tautan hanya berlaku sekali selama 30 menit." : "Masukkan email akunmu untuk menerima tautan pengaturan ulang."}</p>
    <form className="account-form" onSubmit={submit}>{reset ? <><label>Kata sandi baru<input name="password" type="password" required minLength={12} maxLength={72} autoComplete="new-password" /></label><label>Ulangi kata sandi baru<input name="confirmPassword" type="password" required minLength={12} maxLength={72} autoComplete="new-password" /></label>{!token && <p role="alert">Buka tautan lengkap dari email untuk melanjutkan.</p>}</> : <label>Email akun<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>}
      {error && <p role="alert" className="data-error">{error}</p>}{message && <p role="status" className="portal-notice">{message}</p>}<button className="btn-primary-action" disabled={busy || (reset && !token)}>{busy ? "Memproses…" : reset ? "Simpan kata sandi baru" : "Kirim tautan pemulihan"}</button>
    </form>{!reset && <div className="recovery-help"><b>Tidak menerima email atau lupa alamat akun?</b><p>Hubungi petugas klinik. Siapkan NIK, tanggal lahir, dan nomor telepon untuk verifikasi. Petugas dapat membantu menemukan akun dan memberikan password sementara tanpa biaya.</p></div>}</section></main>;
}
