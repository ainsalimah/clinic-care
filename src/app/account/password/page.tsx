"use client";

import { useState } from "react";
import { AlertCircle, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { fetchJson } from "@/lib/http/client";

export default function PasswordPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.password !== data.confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setBusy(true);
    try {
      await fetchJson("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      window.location.assign("/login?passwordChanged=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengganti kata sandi.");
      setBusy(false);
    }
  }

  return (
    <AppLayout activeNav="/account/password" breadcrumbTitle="Ganti Password">
      <div className="page">
        <div className="max-w-3xl">
          <p className="eyebrow text-[#2F80C0]">KEAMANAN AKUN</p>
          <h1 className="mt-2 font-extrabold text-3xl tracking-tight text-[#0B2D45]">Ganti Kata Sandi</h1>
          <p className="mt-3 text-[#527087] leading-relaxed">
            Perbarui kata sandi untuk menjaga akun Anda tetap aman. Setelah berhasil, Anda akan keluar dari semua sesi dan perlu masuk kembali.
          </p>
        </div>

        <section className="mt-8 max-w-3xl rounded-3xl border border-[#d5e2eb] bg-white p-6 shadow-sm sm:p-8" aria-labelledby="password-form-title">
          <div className="flex gap-4 border-b border-[#E8EEF2] pb-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8EEF2] text-[#0B2D45]">
              <KeyRound size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 id="password-form-title" className="font-bold text-xl text-[#0B2D45]">Perbarui Kata Sandi</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#527087]">Gunakan minimal 12 karakter dan jangan gunakan kata sandi yang sama dengan akun lain.</p>
            </div>
          </div>

          <form className="mt-7 space-y-5" onSubmit={submit}>
            <label className="block" htmlFor="current-password">
              <span className="block text-sm font-bold text-[#0B2D45]">Kata Sandi Saat Ini</span>
              <span className="mt-2 flex items-center gap-3 rounded-xl border border-[#c7d9e7] bg-white px-4 py-3 focus-within:border-[#2F80C0] focus-within:ring-2 focus-within:ring-[#2F80C0]/20">
                <LockKeyhole size={18} className="shrink-0 text-[#6e8798]" aria-hidden="true" />
                <input id="current-password" name="currentPassword" type="password" required autoComplete="current-password" maxLength={72} className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-[#0B2D45] outline-none" />
              </span>
            </label>

            <label className="block" htmlFor="new-password">
              <span className="block text-sm font-bold text-[#0B2D45]">Kata Sandi Baru</span>
              <span className="mt-2 flex items-center gap-3 rounded-xl border border-[#c7d9e7] bg-white px-4 py-3 focus-within:border-[#2F80C0] focus-within:ring-2 focus-within:ring-[#2F80C0]/20">
                <LockKeyhole size={18} className="shrink-0 text-[#6e8798]" aria-hidden="true" />
                <input id="new-password" name="password" type="password" required minLength={12} maxLength={72} autoComplete="new-password" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-[#0B2D45] outline-none" />
              </span>
              <span className="mt-2 block text-xs text-[#527087]">Minimal 12 karakter.</span>
            </label>

            <label className="block" htmlFor="confirm-password">
              <span className="block text-sm font-bold text-[#0B2D45]">Ulangi Kata Sandi Baru</span>
              <span className="mt-2 flex items-center gap-3 rounded-xl border border-[#c7d9e7] bg-white px-4 py-3 focus-within:border-[#2F80C0] focus-within:ring-2 focus-within:ring-[#2F80C0]/20">
                <LockKeyhole size={18} className="shrink-0 text-[#6e8798]" aria-hidden="true" />
                <input id="confirm-password" name="confirmPassword" type="password" required minLength={12} maxLength={72} autoComplete="new-password" className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-[#0B2D45] outline-none" />
              </span>
            </label>

            {error && <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} aria-hidden="true" />{error}</p>}

            <div className="flex flex-col gap-4 border-t border-[#E8EEF2] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-[#527087]">
                <ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#2F80C0]" aria-hidden="true" />
                Setelah disimpan, Anda perlu masuk kembali dengan kata sandi baru.
              </p>
              <button type="submit" className="btn shrink-0 !bg-[#2F80C0] !px-5 !py-3 hover:!bg-[#2671AA]" disabled={busy}>
                {busy ? "Menyimpan..." : "Simpan Kata Sandi"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
