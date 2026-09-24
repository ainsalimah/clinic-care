"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import {
  BarChart3,
  Users,
  CalendarDays,
  Pill,
  Package,
  Printer,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  HeartPulse,
  Activity,
} from "lucide-react";

interface ReportData {
  summary: {
    totalPatients: number;
    elderlyPatientsCount: number;
    totalDoctors: number;
    totalDepartments: number;
    totalMedicines: number;
    totalMedicalRecords: number;
    todayVisitsCount: number;
    activeQueuesCount: number;
    completedQueuesCount: number;
    pendingPrescriptionsCount: number;
    completedPrescriptionsCount: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  departments: {
    id: string;
    name: string;
    doctorCount: number;
    visitCount: number;
  }[];
  lowStockList: {
    id: string;
    name: string;
    form: string | null;
    stock: number;
    minimumStock: number;
    unit: string;
  }[];
  recentQueues: {
    id: string;
    queueNumber: string;
    status: string;
    patientName: string;
    medicalRecordNo: string;
    departmentName: string;
    doctorName: string;
    time: string;
  }[];
  recentTransactions: {
    id: string;
    medicineName: string;
    type: "IN" | "OUT" | "ADJUSTMENT";
    quantity: number;
    unit: string;
    notes: string | null;
    createdAt: string;
  }[];
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      const result = await res.json();
      setData(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout breadcrumbTitle="Laporan Operasional" activeNav="/admin/reports">
      <div className="page printable">
        {/* Header */}
        <div className="section-header-flex">
          <div>
            <h1 className="page-title">Laporan & Rekapitulasi Operasional Klinik</h1>
            <p className="page-subtitle">
              Ringkasan statistik kunjungan pasien, efisiensi antrean, pemakaian obat, dan persediaan farmasi.
            </p>
          </div>
          <div className="header-actions-group">
            <button
              type="button"
              className="btn-refresh"
              onClick={fetchReports}
              title="Perbarui data laporan"
            >
              <RefreshCw size={15} className={loading ? "spinner" : ""} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className="btn-primary-action"
              onClick={handlePrint}
              title="Cetak lembar laporan resmi"
            >
              <Printer size={16} />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Stats */}
        {loading || !data ? (
          <div className="table-loading" style={{ margin: "40px 0" }}>
            <Loader2 size={28} className="spinner" />
            <p>Menghitung data agregat operasional klinik...</p>
          </div>
        ) : (
          <>
            <div className="stats">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <Users size={19} />
                </div>
                <div>
                  <p>Pasien Terdaftar</p>
                  <strong>{data.summary.totalPatients} Pasien</strong>
                  <small className="neutral">
                    {data.summary.elderlyPatientsCount} lansia inklusif
                  </small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon teal">
                  <CalendarDays size={19} />
                </div>
                <div>
                  <p>Kunjungan Hari Ini</p>
                  <strong>{data.summary.todayVisitsCount} Antrean</strong>
                  <small className="positive">
                    {data.summary.completedQueuesCount} selesai diperiksa
                  </small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon teal">
                  <Pill size={19} />
                </div>
                <div>
                  <p>Resep Terdistribusi</p>
                  <strong>{data.summary.completedPrescriptionsCount} Resep</strong>
                  <small className="neutral">
                    {data.summary.pendingPrescriptionsCount} dalam penyiapan
                  </small>
                </div>
              </div>

              <div className="stat-card">
                <div
                  className={`stat-icon ${
                    data.summary.lowStockCount > 0 ? "amber" : "teal"
                  }`}
                >
                  <Package size={19} />
                </div>
                <div>
                  <p>Peringatan Stok Obat</p>
                  <strong>{data.summary.lowStockCount} Item</strong>
                  <small
                    className={
                      data.summary.lowStockCount > 0 ? "warn" : "positive"
                    }
                  >
                    {data.summary.outOfStockCount > 0
                      ? `${data.summary.outOfStockCount} obat habis total`
                      : "Persediaan terkendali"}
                  </small>
                </div>
              </div>
            </div>

            {/* Grid 2 Columns: Departments Breakdown & Low Stock Alert */}
            <div className="grid" style={{ marginBottom: "24px" }}>
              {/* Department Breakdown */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">DISTRIBUSI POLIKLINIK</p>
                    <h2>Volume Kunjungan per Poli</h2>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Poliklinik</th>
                        <th>Dokter Aktif</th>
                        <th>Total Pasien Terlayani</th>
                        <th>Persentase Beban</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.departments.map((dept) => {
                        const pct =
                          data.summary.todayVisitsCount > 0
                            ? Math.round(
                                (dept.visitCount /
                                  data.summary.todayVisitsCount) *
                                  100
                              )
                            : 0;

                        return (
                          <tr key={dept.id}>
                            <td>
                              <b>{dept.name}</b>
                            </td>
                            <td>{dept.doctorCount} Dokter</td>
                            <td>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "var(--teal)",
                                }}
                              >
                                {dept.visitCount} Pasien
                              </span>
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    flex: 1,
                                    height: "6px",
                                    background: "#e5ecee",
                                    borderRadius: "4px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${Math.min(pct, 100)}%`,
                                      height: "100%",
                                      background: "var(--teal)",
                                      borderRadius: "4px",
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "var(--muted)",
                                    width: "32px",
                                  }}
                                >
                                  {pct}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Medicines Requiring Restock */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">PERSEDIAAN KRITIS</p>
                    <h2>Obat Perlu Segera Restock</h2>
                  </div>
                  <Link
                    href="/medicines"
                    className="text-btn"
                    style={{ textDecoration: "none" }}
                  >
                    Buka Gudang &rarr;
                  </Link>
                </div>

                <div className="table-wrap">
                  {data.lowStockList.length === 0 ? (
                    <div
                      style={{
                        padding: "30px",
                        textAlign: "center",
                        color: "var(--teal)",
                      }}
                    >
                      <CheckCircle2
                        size={32}
                        style={{ margin: "0 auto 8px" }}
                      />
                      <p style={{ margin: 0, fontWeight: 600 }}>
                        Semua stok obat dalam kondisi aman di atas batas minimum.
                      </p>
                    </div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Nama Obat</th>
                          <th>Sisa Stok</th>
                          <th>Batas Min.</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.lowStockList.map((m) => (
                          <tr key={m.id}>
                            <td>
                              <b>{m.name}</b>{" "}
                              <small style={{ color: "var(--muted)" }}>
                                ({m.form || "Obat"})
                              </small>
                            </td>
                            <td>
                              <b
                                style={{
                                  color:
                                    m.stock === 0 ? "#dc2626" : "#b45309",
                                }}
                              >
                                {m.stock} {m.unit}
                              </b>
                            </td>
                            <td>
                              {m.minimumStock} {m.unit}
                            </td>
                            <td>
                              {m.stock === 0 ? (
                                <span className="stock-danger-badge">
                                  <AlertTriangle size={10} /> Kosong
                                </span>
                              ) : (
                                <span className="stock-warning-badge">
                                  <AlertTriangle size={10} /> Menipis
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row: Recent Queue Activity & Inventory Log */}
            <div className="grid">
              {/* Today's Queue Activity */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">MONITOR ANTREAN AKTUAL</p>
                    <h2>Riwayat Antrean Pasien Hari Ini</h2>
                  </div>
                  <Link
                    href="/queue"
                    className="text-btn"
                    style={{ textDecoration: "none" }}
                  >
                    Lihat Papan Antrean &rarr;
                  </Link>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Pasien & No. RM</th>
                        <th>Poli & Dokter</th>
                        <th>Waktu</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentQueues.map((q) => (
                        <tr key={q.id}>
                          <td>
                            <b className="queue-num">{q.queueNumber}</b>
                          </td>
                          <td>
                            <b>{q.patientName}</b>
                            <span
                              style={{
                                display: "block",
                                fontSize: "11px",
                                color: "var(--muted)",
                              }}
                            >
                              {q.medicalRecordNo}
                            </span>
                          </td>
                          <td>
                            <span>{q.departmentName}</span>
                            <small
                              style={{
                                display: "block",
                                color: "var(--muted)",
                              }}
                            >
                              {q.doctorName}
                            </small>
                          </td>
                          <td>{q.time} WIB</td>
                          <td>
                            <span
                              className={`status-pill ${q.status.toLowerCase()}`}
                            >
                              {q.status === "WAITING"
                                ? "Menunggu"
                                : q.status === "IN_ROOM"
                                ? "Diperiksa"
                                : q.status === "COMPLETED"
                                ? "Selesai"
                                : q.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inventory Mutation Log */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">MUTASI INVENTARIS FARMASI</p>
                    <h2>Log Pengeluaran & Penerimaan Obat</h2>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Obat</th>
                        <th>Tipe</th>
                        <th>Jumlah</th>
                        <th>Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>
                            <b>{tx.medicineName}</b>
                          </td>
                          <td>
                            {tx.type === "OUT" ? (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  color: "#dc2626",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                }}
                              >
                                <TrendingDown size={12} /> Keluar (Resep)
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  color: "#16a34a",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                }}
                              >
                                <TrendingUp size={12} /> Masuk (Restock)
                              </span>
                            )}
                          </td>
                          <td>
                            <b>
                              {tx.type === "OUT" ? "-" : "+"}
                              {tx.quantity} {tx.unit}
                            </b>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--muted)",
                              }}
                            >
                              {tx.notes || "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
