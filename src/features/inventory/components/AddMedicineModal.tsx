"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { fetchJson } from "@/lib/http/client";
import { useDialogAccessibility } from "@/lib/use-dialog-accessibility";

interface AddMedicineModalProps {
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export function AddMedicineModal({ onClose, onSaved }: AddMedicineModalProps) {
  const dialogRef = useDialogAccessibility(onClose);
  const [name, setName] = useState("");
  const [form, setForm] = useState("Tablet");
  const [unit, setUnit] = useState("strip");
  const [price, setPrice] = useState("10000");
  const [stock, setStock] = useState("100");
  const [minimumStock, setMinimumStock] = useState("20");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !unit.trim()) {
      setError("Nama obat dan satuan wajib diisi.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await fetchJson("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(), form, unit: unit.trim(),
          price: Number(price) || 0,
          stock: Number(stock) || 0,
          minimumStock: Number(minimumStock) || 10,
        }),
      });
      await onSaved();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal menambahkan obat baru.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="add-medicine-title" className="modal-card" style={{ maxWidth: "520px" }}>
        <div className="modal-header">
          <div>
            <h3 id="add-medicine-title">Tambah Obat Baru ke Formularium</h3>
            <p>Daftarkan item obat baru ke master katalog apotek</p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div role="alert" className="data-error">{error}</div>}
            <div className="form-group">
              <label className="form-label" htmlFor="medicine-name">Nama Obat & Kekuatan *</label>
              <input id="medicine-name" type="text" className="form-input" placeholder="Contoh: Ibuprofen 400mg"
                value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="medicine-form">Bentuk Sediaan</label>
                <select id="medicine-form" className="form-input" value={form} onChange={(event) => setForm(event.target.value)}>
                  <option value="Tablet">Tablet</option>
                  <option value="Kaplet">Kaplet</option>
                  <option value="Kapsul">Kapsul</option>
                  <option value="Sirup">Sirup</option>
                  <option value="Salep / Krim">Salep / Krim</option>
                  <option value="Tetes (Drops)">Tetes (Drops)</option>
                  <option value="Injeksi">Injeksi</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="medicine-unit">Satuan Kemasan *</label>
                <input id="medicine-unit" type="text" className="form-input" placeholder="Contoh: strip, botol, tube"
                  value={unit} onChange={(event) => setUnit(event.target.value)} required />
              </div>
            </div>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="medicine-price">Harga (Rp)</label>
                <input id="medicine-price" type="number" min={0} className="form-input"
                  value={price} onChange={(event) => setPrice(event.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="medicine-stock">Stok Awal</label>
                <input id="medicine-stock" type="number" min={0} className="form-input"
                  value={stock} onChange={(event) => setStock(event.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="medicine-minimum-stock">Min. Stok Warning</label>
                <input id="medicine-minimum-stock" type="number" min={1} className="form-input"
                  value={minimumStock} onChange={(event) => setMinimumStock(event.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer" style={{ padding: "14px 22px", borderTop: "1px solid #eef2f3" }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Batal</button>
            <button type="submit" className="btn-primary-action" disabled={submitting}>
              {submitting ? <><Loader2 size={15} className="spinner" /> Menyimpan...</> : <><Plus size={15} /> Simpan Obat Baru</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
