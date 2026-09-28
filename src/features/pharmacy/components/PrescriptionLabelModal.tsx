import { useState } from "react";
import { Printer, X } from "lucide-react";
import type { PrescriptionData } from "../types";
import { useDialogAccessibility } from "@/lib/use-dialog-accessibility";

interface PrescriptionLabelModalProps {
  prescription: PrescriptionData;
  onClose: () => void;
}

export function PrescriptionLabelModal({ prescription, onClose }: PrescriptionLabelModalProps) {
  const dialogRef = useDialogAccessibility(onClose);
  const [printError, setPrintError] = useState("");
  const printLabels = () => {
    setPrintError("");
    const date = new Date().toLocaleDateString("id-ID");
    const labels = prescription.items.map((item, index) => `
      <article class="label${index === prescription.items.length - 1 ? " last" : ""}">
        <header><div><strong>KLINIK <i>CARE</i></strong><small>INSTALASI FARMASI</small></div><span>Telp. (022) 720 1234</span></header>
        <div class="meta"><span>No. RM: <b>${prescription.patient.medicalRecordNo}</b></span><span>Tgl: ${date}</span></div>
        <section><small>UNTUK PASIEN</small><b>${prescription.patient.fullName}</b></section>
        <section class="medicine"><small>OBAT</small><div><b>${item.medicine.name}</b><span>${item.quantity} ${item.medicine.unit}</span></div></section>
        <section><small>ATURAN PAKAI</small><b>${item.instruction}</b></section>
        <footer>Simpan obat sesuai petunjuk. Hubungi klinik bila ada keluhan.</footer>
      </article>`).join("");
    const printWindow = window.open("", "cliniccare-label-print", "width=900,height=700");
    if (!printWindow) { setPrintError("Browser memblokir jendela cetak. Izinkan pop-up untuk localhost lalu coba lagi."); return; }
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html lang="id"><head><title>Etiket Obat - KlinikCare</title><style>@page{size:A4 portrait;margin:14mm}*{box-sizing:border-box}body{margin:0;color:#173e35;font-family:Arial,sans-serif}.label{width:100%;border:1px solid #111;padding:12mm;break-inside:avoid;page-break-inside:avoid;page-break-after:always}.label.last{page-break-after:auto}header{display:flex;justify-content:space-between;gap:12mm;padding-bottom:5mm;border-bottom:1px solid #111}header strong{display:block;font-size:18px;letter-spacing:-.04em}header i{color:#17735f;font-style:normal}header small,section small{display:block;margin-top:2mm;font-size:8px;font-weight:700;letter-spacing:.14em}header>span{font-size:10px}.meta{display:flex;justify-content:space-between;padding-top:4mm;font-size:11px}section{margin-top:6mm}section>b{display:block;margin-top:2mm;font-size:18px}.medicine{padding:5mm 0;border-top:1px solid #cbd8d4;border-bottom:1px solid #cbd8d4}.medicine div{display:flex;justify-content:space-between;gap:8mm;align-items:end}.medicine b{font-size:21px}.medicine span{font-weight:700;white-space:nowrap}footer{margin-top:7mm;padding-top:4mm;border-top:1px dashed #bdcbc6;color:#546d65;font-size:10px;line-height:1.4}</style></head><body>${labels}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 250);
  };
  return (
    <div className="modal-backdrop">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="label-modal-title" className="modal-card" style={{ maxWidth: "560px" }}>
        <div className="modal-header print-controls">
          <div>
            <h3 id="label-modal-title">Etiket Aturan Pakai Obat</h3>
            <p>Pasien: <b>{prescription.patient.fullName}</b> ({prescription.patient.medicalRecordNo})</p>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body printable etiket-print-sheet" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {prescription.items.map((item) => (
            <div key={item.id} className="etiket-card">
              <div className="etiket-header">
                <span className="etiket-brand"><b>KLINIK</b><b>CARE</b><small>Instalasi farmasi</small></span>
                <small>Telp. (022) 720 1234</small>
              </div>
              <div className="etiket-meta">
                <span>No. RM: <b>{prescription.patient.medicalRecordNo}</b></span>
                <span>Tgl: {new Date().toLocaleDateString("id-ID")}</span>
              </div>
              <div className="etiket-patient"><small>UNTUK PASIEN</small><b>{prescription.patient.fullName}</b></div>
              <div className="etiket-med"><small>OBAT</small><b>{item.medicine.name}</b><span>{item.quantity} {item.medicine.unit}</span></div>
              <div className="etiket-signa"><small>ATURAN PAKAI</small><b>{item.instruction}</b></div>
              <div className="etiket-foot">Simpan obat sesuai petunjuk. Hubungi klinik bila ada keluhan.</div>
            </div>
          ))}
          <div className="modal-footer print-controls" style={{ borderTop: "1px solid #eef2f3", paddingTop: "14px" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Tutup</button>
            <button type="button" className="btn-print" onClick={printLabels}>
              <Printer size={15} /> Cetak Lembar Etiket
            </button>
          </div>
          {printError && <p role="alert" className="data-error">{printError}</p>}
        </div>
      </div>
    </div>
  );
}
