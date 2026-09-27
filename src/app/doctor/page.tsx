"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import {
  Stethoscope,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowRight,
  Volume2,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface QueueItem {
  id: string;
  queueNumber: string;
  status: "WAITING" | "CALLED" | "IN_ROOM" | "COMPLETED" | "SKIPPED";
  createdAt: string;
  department: { name: string };
  appointment: {
    id: string;
    notes: string | null;
    status: string;
    patient: {
      id: string;
      fullName: string;
      medicalRecordNo: string;
      dateOfBirth: string;
      gender: string;
      allergies: string | null;
      emergencyContactName: string | null;
    };
    doctor: {
      fullName: string;
      specialization: string | null;
    };
  };
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const fetchDoctorQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/queues");
      const data = await res.json();
      if (data.queues) {
        setQueues(data.queues);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorQueue();
  }, []);

  const handleStartExam = async (queue: QueueItem) => {
    setActionLoading(queue.id);
    setActionError("");
    try {
      if (queue.status !== "IN_ROOM") {
        const res = await fetch("/api/queues", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queueId: queue.id, status: "IN_ROOM" }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Gagal membuka pemeriksaan.");
      }
      router.push(`/doctor/examine/${queue.appointment.id}`);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Gagal membuka pemeriksaan.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCallPatient = async (queueId: string) => {
    setActionLoading(queueId);
    setActionError("");
    try {
      const res = await fetch("/api/queues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueId, status: "CALLED" }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal memanggil pasien.");
      await fetchDoctorQueue();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Gagal memanggil pasien.");
    } finally {
      setActionLoading(null);
    }
  };

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const currentPatient = queues.find((q) => q.status === "IN_ROOM");
  const waitingPatients = queues.filter((q) => q.status === "WAITING" || q.status === "CALLED");
  const completedPatients = queues.filter((q) => q.status === "COMPLETED");

  return (
    <AppLayout breadcrumbTitle="Ruang Praktik Dokter" activeNav="/doctor">
      <div className="page">
        {actionError && <div className="data-error" role="alert">{actionError}</div>}
        {/* Header */}
        <div className="section-header-flex">
          <div>
            <h1 className="page-title">Ruang Praktik & Antrean Dokter</h1>
            <p className="page-subtitle">
              Pemeriksaan pasien, pencatatan rekam medis SOAP, dan penerbitan resep digital.
            </p>
          </div>
          <div className="header-actions-group">
            <button type="button" className="btn-refresh" onClick={fetchDoctorQueue}>
              <RefreshCw size={15} className={loading ? "spinner" : ""} />
              <span>Refresh Antrean</span>
            </button>
            <Link href="/records" className="btn-primary-action">
              <FileText size={16} />
              <span>Arsip Rekam Medis</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-icon amber">
              <Clock size={19} />
            </div>
            <div>
              <p>Pasien Menunggu</p>
              <strong>{waitingPatients.length}</strong>
              <small className="warn">Siap diperiksa</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Stethoscope size={19} />
            </div>
            <div>
              <p>Sedang di Ruang Periksa</p>
              <strong>{currentPatient ? 1 : 0}</strong>
              <small className="positive">{currentPatient ? currentPatient.appointment.patient.fullName : "Ruang siap"}</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <p>Selesai Hari Ini</p>
              <strong>{completedPatients.length}</strong>
              <small className="positive">Resep terkirim ke apotek</small>
            </div>
          </div>
        </div>

        {/* Active In-Room Patient Banner if any */}
        {currentPatient && (
          <div className="current-patient-banner">
            <div className="current-badge">SEDANG DIPERIKSA DI RUANG DOKTER</div>
            <div className="current-content">
              <div className="current-info">
                <span className="queue-big-pill">{currentPatient.queueNumber}</span>
                <div>
                  <h2>{currentPatient.appointment.patient.fullName}</h2>
                  <p>
                    No. RM: <b>{currentPatient.appointment.patient.medicalRecordNo}</b> • Usia:{" "}
                    {calculateAge(currentPatient.appointment.patient.dateOfBirth)} tahun • Poli: {currentPatient.department.name}
                  </p>
                  {currentPatient.appointment.patient.allergies &&
                    currentPatient.appointment.patient.allergies.toLowerCase() !== "tidak ada" && (
                      <div className="allergy-warn-pill">
                        <AlertTriangle size={13} />
                        <span>Alergi: {currentPatient.appointment.patient.allergies}</span>
                      </div>
                    )}
                </div>
              </div>
              <button
                type="button"
                className="btn-examine-now"
                onClick={() => router.push(`/doctor/examine/${currentPatient.appointment.id}`)}
              >
                <span>Buka Formulir SOAP & Resep</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Waiting Queue Table */}
        <div className="panel table-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">ANTREAN HARI INI</p>
              <h2>Pasien Menunggu Pemeriksaan ({waitingPatients.length})</h2>
            </div>
          </div>

          <div className="table-wrap">
            {loading ? (
              <div className="table-loading">
                <Loader2 size={24} className="spinner" />
                <p>Memuat antrean dokter...</p>
              </div>
            ) : waitingPatients.length === 0 ? (
              <div className="table-empty">
                <CheckCircle2 size={32} />
                <p>Tidak ada pasien yang sedang menunggu di antrean saat ini.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>No. Antrean</th>
                    <th>Nama Pasien</th>
                    <th>Poli</th>
                    <th>Catatan Keluhan Awal</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Tindakan Dokter</th>
                  </tr>
                </thead>
                <tbody>
                  {waitingPatients.map((q) => {
                    const isElderly = calculateAge(q.appointment.patient.dateOfBirth) >= 60;
                    const isBusy = actionLoading === q.id;
                    const hasAllergy =
                      q.appointment.patient.allergies &&
                      q.appointment.patient.allergies.toLowerCase() !== "tidak ada";

                    return (
                      <tr key={q.id}>
                        <td>
                          <b className="queue-badge-large">{q.queueNumber}</b>
                        </td>
                        <td>
                          <div className="patient-cell">
                            <div>
                              <b className="patient-name">{q.appointment.patient.fullName}</b>
                              <small className="patient-meta">
                                {q.appointment.patient.medicalRecordNo} • {calculateAge(q.appointment.patient.dateOfBirth)} thn
                                {isElderly && <span className="badge-elderly">Lansia</span>}
                                {hasAllergy && (
                                  <span className="badge-allergy-micro">
                                    <AlertTriangle size={9} /> Alergi
                                  </span>
                                )}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="dept-tag">{q.department.name}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "var(--ink)" }}>
                            {q.appointment.notes || "Pemeriksaan umum"}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${q.status.toLowerCase()}`}>
                            {q.status === "WAITING" ? "Menunggu" : "Dipanggil"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="action-buttons-group">
                            {(q.status === "WAITING" || q.status === "CALLED") && (
                              <button
                                type="button"
                                className="btn-action-call"
                                disabled={isBusy}
                                onClick={() => handleCallPatient(q.id)}
                              >
                                <Volume2 size={13} /> {q.status === "CALLED" ? "Panggil Ulang" : "Panggil"}
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-action-done"
                              disabled={isBusy}
                              onClick={() => handleStartExam(q)}
                            >
                              <Stethoscope size={13} /> Mulai Periksa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
