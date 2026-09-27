"use client";

import { useState, type FormEvent } from "react";
import { Loader2, TrendingUp, X } from "lucide-react";
import { fetchJson } from "@/lib/http/client";
import type { Medicine } from "../types";
import { useDialogAccessibility } from "@/lib/use-dialog-accessibility";

interface RestockMedicineModalProps {
  medicine: Medicine;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export function RestockMedicineModal({ medicine, onClose, onSaved }: RestockMedicineModalProps) {
  const dialogRef = useDialogAccessibility(onClose);
  const [quantity, setQuantity] = useState(50);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (quantity <= 0) {
      setError("Jumlah restock harus lebih dari 0.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await fetchJson(`/api/medicines/${medicine.id}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity, notes: notes.trim() || "Penerimaan restock gudang farmasi" }),
      });
      await onSaved();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal melakukan restock obat.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="restock-title" className="modal-card">
        <div className="modal-header">
          <div>
            <h3 id="restock-title">Penerimaan / Restock Obat</h3>
            <p>{medicine.name} ({medicine.unit})</p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div role="alert" className="data-error">{error}</div>}
            <div style={{ background: "#f8fbfb", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e1ebed" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "var(--muted)" }}>Stok Gudang Saat Ini:</span>
                <b style={{ color: "var(--ink)", fontSize: "14px" }}>{medicine.stock} {medicine.unit}</b>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="restock-quantity">Jumlah Tambahan Masuk ({medicine.unit}) *</label>
              <input id="restock-quantity" type="number" min={1} className="form-input" value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="restock-notes">Catatan Penerimaan / No. Faktur</label>
              <input id="restock-notes" type="text" className="form-input"
                placeholder="Contoh: Faktur No. INV-2026-001 dari PT Kimia Farma"
                value={notes} onChange={(event) => setNotes(event.target.value)} />
            </div>
          </div>
          <div className="modal-footer" style={{ padding: "14px 22px", borderTop: "1px solid #eef2f3" }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Batal</button>
            <button type="submit" className="btn-primary-action" disabled={submitting}>
              {submitting ? <><Loader2 size={15} className="spinner" /> Menyimpan...</> : <><TrendingUp size={15} /> Konfirmasi Restock</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
