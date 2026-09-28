"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { fetchJson } from "@/lib/http/client";
import { PrescriptionLabelModal } from "./PrescriptionLabelModal";
import type { PrescriptionData } from "../types";
import { BillingPanel } from "@/features/billing/components/BillingPanel";
import { StockHoldControl } from "./StockHoldControl";
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Search,
  Package,
  Loader2,
  RefreshCw,
  Check,
  Send,
} from "lucide-react";

export default function PharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [billingRevision, setBillingRevision] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Etiket / Label Print modal state
  const [selectedRxForEtiket, setSelectedRxForEtiket] = useState<PrescriptionData | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      let url = "/api/prescriptions";
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (submittedQuery) params.set("q", submittedQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const data = await fetchJson<{ prescriptions: PrescriptionData[] }>(url);
      setPrescriptions(data.prescriptions);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Gagal memuat resep.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, submittedQuery]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query === submittedQuery) fetchPrescriptions();
    else setSubmittedQuery(query);
  };

  const handleUpdateStatus = async (prescriptionId: string, newStatus: string) => {
    setActionLoading(prescriptionId);
    try {
      const res = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setBillingRevision(value => value + 1);
        await fetchPrescriptions();
      } else {
        alert(data.error || "Gagal memperbarui status resep.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(null);
    }
  };

  // Stats calculation
  const countPending = prescriptions.filter((p) => p.status === "PENDING").length;
  const countProcessing = prescriptions.filter((p) => p.status === "PROCESSING").length;
  const countReady = prescriptions.filter((p) => p.status === "READY").length;
  const countCompleted = prescriptions.filter((p) => p.status === "COMPLETED").length;

  return (
    <AppLayout breadcrumbTitle="Layanan Resep & Apotek" activeNav="/pharmacy">
      <div className="page">
        {loadError && <div role="alert" className="data-error">{loadError}</div>}
        {/* Header */}
        <div className="section-header-flex">
          <div>
            <h1 className="page-title">Pengelolaan Resep Farmasi & Apotek</h1>
            <p className="page-subtitle">
              Penerimaan resep digital, verifikasi ketersediaan obat, penyerahan, dan pengurangan stok otomatis.
            </p>
          </div>
          <div className="header-actions-group">
            <button
              type="button"
              className="btn-refresh"
              onClick={fetchPrescriptions}
              title="Perbarui daftar resep"
            >
              <RefreshCw size={15} className={loading ? "spinner" : ""} />
              <span>Refresh</span>
            </button>
            <Link href="/medicines" className="btn-primary-action">
              <Package size={16} />
              <span>Katalog & Stok Obat</span>
            </Link>
          </div>
        </div>

        <BillingPanel revision={billingRevision} onPaid={fetchPrescriptions} />
        {/* Stats */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-icon amber">
              <Clock size={19} />
            </div>
            <div>
              <p>Resep Baru Masuk</p>
              <strong>{countPending}</strong>
              <small className="warn">Perlu segera diproses</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Pill size={19} />
            </div>
            <div>
              <p>Sedang Disiapkan</p>
              <strong>{countProcessing}</strong>
              <small className="positive">Dalam peracikan / pengambilan</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <p>Siap Diserahkan</p>
              <strong>{countReady}</strong>
              <small className="positive">Siap dipanggil di loket</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">
              <Package size={19} />
            </div>
            <div>
              <p>Selesai & Terdistribusi</p>
              <strong>{countCompleted}</strong>
              <small className="positive">Stok telah dipotong</small>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="filter-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <form onSubmit={handleSearch} className="search-form" style={{ flex: 1, minWidth: "260px" }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Cari berdasarkan Nama Pasien, No. RM, atau Dokter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn-search">
              Cari
            </button>
          </form>

          {/* Status Tabs */}
          <div className="rx-status-tabs">
            <button
              type="button"
              className={`tab-btn ${statusFilter === "ALL" ? "active" : ""}`}
              onClick={() => setStatusFilter("ALL")}
            >
              Semua ({prescriptions.length})
            </button>
            <button
              type="button"
              className={`tab-btn tab-pending ${statusFilter === "PENDING" ? "active" : ""}`}
              onClick={() => setStatusFilter("PENDING")}
            >
              Menunggu ({countPending})
            </button>
            <button
              type="button"
              className={`tab-btn tab-proc ${statusFilter === "PROCESSING" ? "active" : ""}`}
              onClick={() => setStatusFilter("PROCESSING")}
            >
              Disiapkan ({countProcessing})
            </button>
            <button
              type="button"
              className={`tab-btn tab-ready ${statusFilter === "READY" ? "active" : ""}`}
              onClick={() => setStatusFilter("READY")}
            >
              Siap Diambil ({countReady})
            </button>
            <button
              type="button"
              className={`tab-btn ${statusFilter === "COMPLETED" ? "active" : ""}`}
              onClick={() => setStatusFilter("COMPLETED")}
            >
              Selesai ({countCompleted})
            </button>
          </div>
        </div>

        {/* Prescriptions List Cards */}
        <div className="records-list-container">
          {loading ? (
            <div className="table-loading">
              <Loader2 size={24} className="spinner" />
              <p>Memuat resep farmasi...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="table-empty">
              <Pill size={36} />
              <p>Tidak ada resep yang sesuai dengan filter saat ini.</p>
            </div>
          ) : (
            prescriptions.map((rx) => {
              const isBusy = actionLoading === rx.id;
              const held = Boolean(rx.stockHeldAt && !rx.stockResumedAt);
              const hasAllergies = rx.patient.allergies && rx.patient.allergies.toLowerCase() !== "tidak ada";

              return (
                <div key={rx.id} className="record-card">
                  {/* Card Header */}
                  <div className="record-header">
                    <div className="record-meta">
                      <span className={`status-pill ${rx.status.toLowerCase()}`}>
                        {held ? "Menunggu Stok" : rx.status === "PENDING"
                          ? "Menunggu Diproses"
                          : rx.status === "PROCESSING"
                          ? "Sedang Disiapkan"
                          : rx.status === "READY"
                          ? "Siap Diambil"
                          : "Selesai Diserahkan"}
                      </span>
                      <span className="record-rm">{rx.patient.medicalRecordNo}</span>
                      <b className="record-patient">{rx.patient.fullName}</b>
                      {hasAllergies && (
                        <span className="allergy-warn-badge">
                          <AlertTriangle size={11} /> Alergi: {rx.patient.allergies}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="record-doc">
                        {rx.doctor.fullName} ({rx.doctor.department.name})
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                        {new Date(rx.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                      </span>
                    </div>
                  </div>

                  {/* Body with Medicines Table */}
                  <div className="record-details-box" style={{ background: "#fff" }}>
                    {rx.medicalRecord.appointment.bill && <p className="portal-notice">
                      {rx.medicalRecord.appointment.bill.paidAt ? "Tagihan lunas. Obat siap diserahkan setelah persiapan selesai." : "Tagihan belum dibayar. Terima pembayaran melalui Kasir Apotek sebelum menyerahkan obat."}
                    </p>}
                    {rx.medicalRecord.diagnosis && (
                      <p style={{ margin: "0 0 12px", fontSize: "12px", color: "var(--ink)" }}>
                        Diagnosis Medis: <b>{rx.medicalRecord.diagnosis}</b>
                      </p>
                    )}

                    <table className="rx-table">
                      <thead>
                        <tr>
                          <th>Nama Obat & Sediaan</th>
                          <th>Dosis</th>
                          <th>Jumlah Diminta</th>
                          <th>Sisa Stok Gudang</th>
                          <th>Aturan Pakai & Signa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rx.items.map((item) => {
                          const available = rx.medicalRecord.appointment.bill?.paidAt ? item.medicine.stock : item.medicine.stock - item.medicine.reservedStock;
                          const isLowStock = available < item.quantity;
                          return (
                            <tr key={item.id}>
                              <td>
                                <b>{item.medicine.name}</b> ({item.medicine.form || "Obat"})
                              </td>
                              <td>{item.dosage}</td>
                              <td>
                                <b style={{ color: "var(--ink)" }}>{item.quantity} {item.medicine.unit}</b>
                              </td>
                              <td>
                                <span className={isLowStock ? "stock-danger" : "stock-safe"}>
                                  {available} {item.medicine.unit} {isLowStock ? "(Stok Kurang!)" : ""}
                                </span>
                              </td>
                              <td>
                                <span style={{ color: "var(--teal)", fontWeight: 600 }}>{item.instruction}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {rx.notes && (
                      <p className="rx-note-text" style={{ marginTop: "10px", margin: "10px 0 0" }}>
                        Catatan Dokter: <b>{rx.notes}</b>
                      </p>
                    )}

                    <StockHoldControl rx={rx} refresh={() => { void fetchPrescriptions(); setBillingRevision(value => value + 1); }} />
                    {/* Action Toolbar per Stage */}
                    <div className="rx-action-toolbar">
                      <button
                        type="button"
                        className="btn-print"
                        onClick={() => setSelectedRxForEtiket(rx)}
                        title="Cetak Etiket Aturan Pakai Obat"
                      >
                        <Printer size={14} /> Cetak Etiket Obat
                      </button>

                      <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
                        {/* If PENDING -> Mulai Siapkan */}
                        {rx.status === "PENDING" && (
                          <button
                            type="button"
                            className="btn-proc-action"
                            disabled={isBusy}
                            onClick={() => handleUpdateStatus(rx.id, "PROCESSING")}
                          >
                            <Pill size={14} /> Mulai Siapkan Obat
                          </button>
                        )}

                        {/* If PROCESSING -> Tandai Siap */}
                        {rx.status === "PROCESSING" && !held && (
                          <button
                            type="button"
                            className="btn-ready-action"
                            disabled={isBusy}
                            onClick={() => handleUpdateStatus(rx.id, "READY")}
                          >
                            <Check size={14} /> Tandai Siap Diambil
                          </button>
                        )}

                        {/* If READY -> Serahkan Obat & Potong Stok */}
                        {rx.status === "READY" && (
                          <button
                            type="button"
                            className="btn-dispense-action"
                            disabled={isBusy || Boolean(rx.medicalRecord.appointment.bill && !rx.medicalRecord.appointment.bill.paidAt)}
                            title={rx.medicalRecord.appointment.bill && !rx.medicalRecord.appointment.bill.paidAt ? "Lunasi melalui Kasir Apotek terlebih dahulu" : undefined}
                            onClick={() => {
                              if (confirm(`Serahkan obat ke pasien ${rx.patient.fullName}? Stok obat akan otomatis dipotong dan dicatat ke mutasi inventaris.`)) {
                                handleUpdateStatus(rx.id, "COMPLETED");
                              }
                            }}
                          >
                            <Send size={14} />
                            <span>Serahkan Obat ke Pasien & Potong Stok Otomatis</span>
                          </button>
                        )}

                        {rx.status === "COMPLETED" && (
                          <span className="dispensed-stamp">
                            ✓ Obat telah diserahkan • Stok terpotong
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {selectedRxForEtiket && (
          <PrescriptionLabelModal
            prescription={selectedRxForEtiket}
            onClose={() => setSelectedRxForEtiket(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
