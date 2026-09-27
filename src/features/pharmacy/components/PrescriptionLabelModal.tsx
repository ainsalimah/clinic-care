import { Printer, X } from "lucide-react";
import type { PrescriptionData } from "../types";
import { useDialogAccessibility } from "@/lib/use-dialog-accessibility";

interface PrescriptionLabelModalProps {
  prescription: PrescriptionData;
  onClose: () => void;
}

export function PrescriptionLabelModal({ prescription, onClose }: PrescriptionLabelModalProps) {
  const dialogRef = useDialogAccessibility(onClose);
  return (
    <div className="modal-backdrop">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="label-modal-title" className="modal-card" style={{ maxWidth: "560px" }}>
        <div className="modal-header">
          <div>
            <h3 id="label-modal-title">Etiket Aturan Pakai Obat</h3>
            <p>Pasien: <b>{prescription.patient.fullName}</b> ({prescription.patient.medicalRecordNo})</p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body printable" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {prescription.items.map((item) => (
            <div key={item.id} className="etiket-card">
              <div className="etiket-header">
                <b>KLINIKCARE — INSTALASI FARMASI</b>
                <small>Telp: (022) 7201234</small>
              </div>
              <div className="etiket-meta">
                <span>No. RM: <b>{prescription.patient.medicalRecordNo}</b></span>
                <span>Tgl: {new Date().toLocaleDateString("id-ID")}</span>
              </div>
              <div className="etiket-patient">Nama: <b>{prescription.patient.fullName}</b></div>
              <div className="etiket-med">{item.medicine.name} — Qty: {item.quantity} {item.medicine.unit}</div>
              <div className="etiket-signa">{item.instruction}</div>
              <div className="etiket-foot">Semoga Lekas Sembuh</div>
            </div>
          ))}
          <div className="modal-footer" style={{ borderTop: "1px solid #eef2f3", paddingTop: "14px" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Tutup</button>
            <button type="button" className="btn-print" onClick={() => window.print()}>
              <Printer size={15} /> Cetak Lembar Etiket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
