"use client";
import { useState } from "react";
import { fetchJson } from "@/lib/http/client";
import type { PrescriptionData } from "../types";
export function StockHoldControl({ rx, refresh }: { rx: PrescriptionData; refresh: () => void }) {
  const [reason, setReason] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const held = Boolean(rx.stockHeldAt && !rx.stockResumedAt);
  const shortage = rx.items.some(i => i.medicine.stock - i.medicine.reservedStock < i.quantity);
  if (["COMPLETED", "CANCELLED"].includes(rx.status) || rx.medicalRecord.appointment.bill?.paidAt || (!held && !shortage)) return null;
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await fetchJson("/api/stock-holds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: rx.id, hold: !held, reason }) }); refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal memperbarui resep."); }
    finally { setBusy(false); }
  }
  return <form className="account-form portal-notice" onSubmit={submit}>
    <strong>{held ? "Ditunda — menunggu stok tersedia" : "Stok tersedia belum mencukupi"}</strong>
    <p>{held ? rx.stockHoldReason : "Tunda resep dan beri tahu pasien. Pembayaran serta penyerahan menunggu stok lengkap."}</p>
    {!held && <label>Alasan penundaan<textarea required minLength={5} maxLength={500} value={reason} onChange={e => setReason(e.target.value)} /></label>}
    {error && <p role="alert">{error}</p>}
    <button className="btn-secondary" disabled={busy || (held && shortage)}>{busy ? "Menyimpan…" : held ? "Stok tersedia, lanjutkan persiapan" : "Tunda sampai stok tersedia"}</button>
    {held && shortage && <small>Lengkapi stok di menu Obat & Stok, lalu muat ulang daftar resep.</small>}
  </form>;
}
