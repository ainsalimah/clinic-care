import { HeartPulse, Printer } from "lucide-react";
import type { QueueItem } from "../types";

interface QueueTicketProps {
  queue: QueueItem;
  onClose: () => void;
}

export function QueueTicket({ queue, onClose }: QueueTicketProps) {
  const issuedAt = new Date(queue.createdAt);

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-ticket">
        <div className="ticket-card printable">
          <div className="ticket-head">
            <div className="ticket-brand">
              <HeartPulse size={20} />
              <span>KlinikCare — Tiket Antrean</span>
            </div>
            <span className="ticket-rm">{queue.appointment.patient.medicalRecordNo}</span>
          </div>
          <div className="ticket-queue-section">
            <small>NOMOR ANTREAN ANDA</small>
            <div className="queue-big-number">{queue.queueNumber}</div>
            <p><b>{queue.department.name}</b></p>
            <p style={{ fontSize: "14px", marginTop: "2px" }}>
              Dokter: {queue.appointment.doctor.fullName}
            </p>
            <p style={{ fontSize: "13px", marginTop: "4px" }}>
              Pasien: <b>{queue.appointment.patient.fullName}</b>
            </p>
            <small>
              {issuedAt.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              {" • "}
              {issuedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
            </small>
          </div>
          <div className="ticket-actions">
            <button type="button" className="btn-print" onClick={() => window.print()}>
              <Printer size={16} /> Cetak Tiket Ini
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>Tutup</button>
          </div>
        </div>
      </div>
    </div>
  );
}
