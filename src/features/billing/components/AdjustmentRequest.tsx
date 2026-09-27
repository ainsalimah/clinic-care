"use client";
import { useState } from "react";
import { fetchJson } from "@/lib/http/client";

export function AdjustmentRequest({ billId, paid, done }: { billId: string; paid: boolean; done: () => void }) {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState("minus");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await fetchJson("/api/bill-adjustments", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", id: billId, kind: paid ? "REFUND" : "CORRECTION",
          amount: Number(amount) * (!paid && direction === "minus" ? -1 : 1), reason }) });
      done();
    } catch (err) { setError(err instanceof Error ? err.message : "Pengajuan gagal."); }
    finally { setBusy(false); }
  }
  return <details className="billing-payment"><summary>{paid ? "Ajukan refund" : "Ajukan koreksi biaya"}</summary>
    <form className="billing-payment" onSubmit={submit}>
      <p>{paid ? "Refund memerlukan persetujuan admin dan pencatatan penyerahan uang. Tidak mengubah resep atau stok." : "Koreksi nominal dicatat sebagai baris penyesuaian; tidak mengubah jumlah atau isi resep. Pembayaran ditunda sampai keputusan admin."}</p>
      {!paid && <label>Jenis koreksi<select className="form-input" value={direction} onChange={e => setDirection(e.target.value)}><option value="minus">Kurangi biaya</option><option value="plus">Tambah biaya</option></select></label>}
      <label>Nominal (Rp)<input className="form-input" type="number" min="1" max="2000000000" step="1" required value={amount} onChange={e => setAmount(e.target.value)} /></label>
      <label>Alasan pengajuan<textarea className="form-input" minLength={5} maxLength={1000} required value={reason} onChange={e => setReason(e.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <button className="btn-secondary" disabled={busy}>{busy ? "Mengirim…" : "Kirim ke admin"}</button>
    </form>
  </details>;
}
