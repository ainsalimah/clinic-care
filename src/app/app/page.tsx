"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import {
  Users,
  CalendarDays,
  Pill,
  Package,
  Plus,
  Stethoscope,
  ChevronRight,
  HeartPulse,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2,
  BarChart3,
  ClipboardList,
  ShieldAlert,
  X,
} from "lucide-react";

interface ReportSummary {
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
}

interface QueueItem {
  id: string;
  queueNumber: string;
  status: string;
  patientName: string;
  medicalRecordNo: string;
  departmentName: string;
  doctorName: string;
  time: string;
}

export default function Home() {
  const router = useRouter();
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [recentQueues, setRecentQueues] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("RECEPTIONIST");
  const [unauthorizedMsg, setUnauthorizedMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [reportsRes, authRes] = await Promise.all([
        fetch("/api/admin/reports"),
        fetch("/api/auth/me"),
      ]);

      const data = await reportsRes.json();
      if (data.summary) {
        setSummary(data.summary);
      }
      if (data.recentQueues) {
        setRecentQueues(data.recentQueues);
      }

      const authData = await authRes.json();
      if (authData.user?.role) {
        setUserRole(authData.user.role);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Cek jika dialihkan dari rute terlarang
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const deniedPath = params.get("unauthorized");
      if (deniedPath) {
        setUnauthorizedMsg(`Akses dibatasi: Anda tidak memiliki wewenang untuk membuka halaman /${deniedPath}. Halaman tersebut hanya dapat diakses oleh peran terkait.`);
        // Bersihkan query param dari URL tanpa reload
        window.history.replaceState({}, "", "/app");
      }
    }
  }, []);

  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const isAdmin = userRole === "ADMIN";
  const isDoctor = userRole === "DOCTOR";
  const isPharmacist = userRole === "PHARMACIST";
  const isReceptionist = userRole === "RECEPTIONIST";
  return (
    <AppLayout breadcrumbTitle="Dashboard Utama" activeNav="/app">
      <div className="page">
        {/* Banner Peringatan jika mengakses rute terlarang */}
        {unauthorizedMsg && (
          <div
            style={{
              background: "#fff1f0",
              border: "1.5px solid #fca5a5",
              borderRadius: "12px",
              padding: "14px 18px",
              color: "#991b1b",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(239,68,68,.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldAlert size={20} color="#dc2626" />
              <div>
                <b style={{ fontSize: "13px", display: "block" }}>Hak Akses Dibatasi (RBAC)</b>
                <span style={{ fontSize: "12px" }}>{unauthorizedMsg}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUnauthorizedMsg(null)}
              style={{ background: "transparent", border: 0, color: "#991b1b", cursor: "pointer" }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Hero Section */}
        <section className="hero">
          <div>
            <p>
              {isDoctor
                ? "Pelayanan Medis & Praktik Dokter"
                : isPharmacist
                ? "Instalasi Farmasi & Apotek"
                : isReceptionist
                ? "Meja Registrasi & Pendaftaran"
                : "Sistem Informasi Manajemen Terpadu"}
            </p>
            <h1>Selamat Datang di KlinikCare</h1>
            <span>
              {isDoctor
                ? "Kelola antrean ruang periksa, catat rekam medis SOAP, dan terbitkan resep digital."
                : isPharmacist
                ? "Siapkan resep obat masuk, verifikasi stok, cetak etiket, dan serahkan obat ke pasien."
                : isReceptionist
                ? "Kelola pendaftaran pasien umum & lansia, check-in nomor antrean, dan cetak tiket fisik."
                : "Platform pelayanan kesehatan inklusif, ramah lansia, dan terintegrasi dari pendaftaran hingga apotek."}
            </span>
          </div>
          <div className="today">
            <CalendarDays size={18} />
            <div>
              <b>{todayFormatted}</b>
              <small>Jam Operasional: 08.00 – 21.00 WIB</small>
            </div>
          </div>
        </section>

        {/* Real-time KPI Stats */}
        <section className="stats">
          <article className="stat-card">
            <div className="stat-icon teal">
              <Users size={19} />
            </div>
            <div>
              <p>Total Pasien Terdaftar</p>
              <strong>
                {loading ? <Loader2 size={16} className="spinner" /> : `${summary?.totalPatients || 0} Pasien`}
              </strong>
              <small className="positive">
                {summary?.elderlyPatientsCount || 0} pasien lansia inklusif
              </small>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon blue">
              <Clock size={19} />
            </div>
            <div>
              <p>Antrean Aktif Hari Ini</p>
              <strong>
                {loading ? <Loader2 size={16} className="spinner" /> : `${summary?.activeQueuesCount || 0} Menunggu`}
              </strong>
              <small className="neutral">
                Total {summary?.todayVisitsCount || 0} kunjungan hari ini
              </small>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon amber">
              <Pill size={19} />
            </div>
            <div>
              <p>Resep Diproses Apotek</p>
              <strong>
                {loading ? <Loader2 size={16} className="spinner" /> : `${summary?.pendingPrescriptionsCount || 0} Resep`}
              </strong>
              <small className="warn">
                {summary?.completedPrescriptionsCount || 0} selesai terdistribusi
              </small>
            </div>
          </article>

          <article className="stat-card">
            <div className={`stat-icon ${(summary?.lowStockCount || 0) > 0 ? "coral" : "teal"}`}>
              <Package size={19} />
            </div>
            <div>
              <p>Peringatan Stok Obat</p>
              <strong>
                {loading ? <Loader2 size={16} className="spinner" /> : `${summary?.lowStockCount || 0} Item Menipis`}
              </strong>
              <small className={(summary?.lowStockCount || 0) > 0 ? "danger" : "positive"}>
                {(summary?.outOfStockCount || 0) > 0
                  ? `${summary?.outOfStockCount} obat habis total`
                  : "Stok formularium aman"}
              </small>
            </div>
          </article>
        </section>

        {/* Main Grid: Queue Table & Quick Actions */}
        <section className="dashboard-grid">
          {/* Real Queues Panel */}
          <article className="panel queue-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">MONITOR KUNJUNGAN REAL-TIME</p>
                <h2>Antrean Pasien Terkini</h2>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-refresh"
                  style={{ padding: "4px 8px", fontSize: "11px" }}
                  onClick={fetchDashboardData}
                >
                  <RefreshCw size={12} className={loading ? "spinner" : ""} /> Refresh
                </button>
                {(isAdmin || isReceptionist || isDoctor) && (
                  <Link href={isDoctor ? "/doctor" : "/queue"} className="text-btn" style={{ textDecoration: "none" }}>
                    {isDoctor ? "Buka Antrean Saya" : "Buka Papan Antrean"} <ChevronRight size={16} />
                  </Link>
                )}
              </div>
            </div>

            <div className="table-wrap">
              {loading ? (
                <div className="table-loading" style={{ padding: "30px" }}>
                  <Loader2 size={20} className="spinner" />
                  <p>Memuat antrean...</p>
                </div>
              ) : recentQueues.length === 0 ? (
                <div className="table-empty" style={{ padding: "30px" }}>
                  <CheckCircle2 size={28} />
                  <p>Belum ada antrean terdaftar hari ini.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Pasien</th>
                      <th>Poli & Dokter</th>
                      <th>Waktu</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentQueues.map((q) => (
                      <tr key={q.id}>
                        <td>
                          <b className="queue-num">{q.queueNumber}</b>
                        </td>
                        <td>
                          <div className="patient">
                            <span>{q.patientName[0]}</span>
                            <div>
                              <b>{q.patientName}</b>
                              <small style={{ display: "block", color: "var(--muted)", fontSize: "10px" }}>
                                {q.medicalRecordNo}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span>{q.departmentName}</span>
                          <small style={{ display: "block", color: "var(--muted)", fontSize: "10px" }}>
                            {q.doctorName}
                          </small>
                        </td>
                        <td>{q.time}</td>
                        <td>
                          <span className={`status-pill ${q.status.toLowerCase()}`}>
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
              )}
            </div>
          </article>

          {/* Quick Action Navigation Panel - Role Adapted */}
          <article className="panel quick-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">AKSI CEPAT SESUAI ROLE</p>
                <h2>Mulai Layanan</h2>
              </div>
            </div>

            {/* Pendaftaran pasien dan check-in dilakukan resepsionis. */}
            {isReceptionist && (
              <button
                type="button"
                className="quick primary"
                onClick={() => router.push("/patients")}
              >
                <Plus size={19} />
                <span>
                  <b>Cari Pasien / Check-in</b>
                  <small>Cari pasien lama; daftarkan bila belum ada</small>
                </span>
                <ChevronRight size={17} />
              </button>
            )}

            {isReceptionist && (
              <button
                type="button"
                className="quick"
                onClick={() => router.push("/appointments")}
              >
                <CalendarDays size={19} />
                <span>
                  <b>Pengajuan Kunjungan Online</b>
                  <small>Periksa data dan konfirmasi jadwal pasien</small>
                </span>
                <ChevronRight size={17} />
              </button>
            )}

            {/* Pemeriksaan dan rekam medis hanya untuk dokter. */}
            {isDoctor && (
              <button
                type="button"
                className="quick"
                onClick={() => router.push("/doctor")}
              >
                <Stethoscope size={19} />
                <span>
                  <b>Ruang Praktik Dokter</b>
                  <small>Pemeriksaan medis SOAP & resep digital</small>
                </span>
                <ChevronRight size={17} />
              </button>
            )}

            {/* Pemrosesan resep hanya untuk apoteker. */}
            {isPharmacist && (
              <button
                type="button"
                className="quick"
                onClick={() => router.push("/pharmacy")}
              >
                <Pill size={19} />
                <span>
                  <b>Layanan Apotek & Resep</b>
                  <small>Peracikan, etiket obat, & pengurangan stok otomatis</small>
                </span>
                <ChevronRight size={17} />
              </button>
            )}

            {/* Admin hanya memantau antrean; resepsionis juga dapat mengelolanya. */}
            {(isAdmin || isReceptionist) && <button
              type="button"
              className="quick"
              onClick={() => router.push("/queue")}
            >
              <CalendarDays size={19} />
              <span>
                <b>Papan Antrean & Tiket</b>
                <small>Pantau nomor antrean dan status panggilan</small>
              </span>
              <ChevronRight size={17} />
            </button>}

            {/* Arsip rekam medis hanya untuk dokter. */}
            {isDoctor && (
              <button
                type="button"
                className="quick"
                onClick={() => router.push("/records")}
              >
                <ClipboardList size={19} />
                <span>
                  <b>Arsip Rekam Medis</b>
                  <small>Riwayat keluhan, diagnosis, dan terapi pasien</small>
                </span>
                <ChevronRight size={17} />
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                className="quick"
                onClick={() => router.push("/medicines")}
              >
                <Package size={19} />
                <span>
                  <b>Pantau Obat & Stok</b>
                  <small>Lihat ketersediaan dan peringatan stok klinik</small>
                </span>
                <ChevronRight size={17} />
              </button>
            )}

            {/* Aksi Laporan Khusus Admin */}
            {isAdmin && (
              <button
                type="button"
                className="quick"
                onClick={() => router.push("/admin/reports")}
              >
                <BarChart3 size={19} />
                <span>
                  <b>Laporan Operasional Eksekutif</b>
                  <small>Statistik kunjungan, beban poli, & pemakaian obat</small>
                </span>
                <ChevronRight size={17} />
              </button>
            )}

            {/* Inclusive Elderly Care Callout */}
            <div className="elder-note">
              <HeartPulse size={18} />
              <div>
                <b>Inklusif Pasien Lansia</b>
                <p>
                  Pendaftaran mudah hanya dengan NIK / No. RM. Dilengkapi cetak tiket fisik dan etiket obat jelas tanpa kewajiban smartphone.
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </AppLayout>
  );
}
