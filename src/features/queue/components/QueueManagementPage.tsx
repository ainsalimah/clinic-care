"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { fetchJson } from "@/lib/http/client";
import { QueueTicket } from "@/features/queue/components/QueueTicket";
import type { QueueItem } from "@/features/queue/types";
import { prepareQueueSpeech, speakQueueAnnouncement } from "@/features/queue/client/speech";
import {
  CalendarDays,
  Clock,
  Printer,
  UserPlus,
  Users,
  CheckCircle,
  Stethoscope,
  Volume2,
  RefreshCw,
  Loader2,
  PhoneOff,
} from "lucide-react";

interface Department {
  id: string;
  name: string;
}

export default function QueueManagementPage() {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const isReceptionist = userRole === "RECEPTIONIST";
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [ticketToPrint, setTicketToPrint] = useState<QueueItem | null>(null);
  const [callNotice, setCallNotice] = useState("");

  const fetchQueues = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      let url = "/api/queues";
      const params = new URLSearchParams();
      if (selectedDeptFilter !== "ALL") params.set("departmentId", selectedDeptFilter);
      if (selectedStatusFilter !== "ALL") params.set("status", selectedStatusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const data = await fetchJson<{ queues: QueueItem[] }>(url);
      setQueues(data.queues);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Gagal memuat antrean.");
    } finally {
      setLoading(false);
    }
  }, [selectedDeptFilter, selectedStatusFilter]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUserRole(data.user?.role ?? null))
      .catch(() => setUserRole(null));
    fetchJson<{ departments: Department[] }>("/api/departments")
      .then((data) => {
        if (data.departments) setDepartments(data.departments);
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Gagal memuat poli."));
  }, []);

  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  const handleUpdateStatus = async (queueId: string, newStatus: string) => {
    setActionLoading(queueId);
    try {
      const res = await fetch("/api/queues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueId, status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memperbarui status antrean.");
      }
      await fetchQueues();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal memperbarui status antrean.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCall = async (queueId: string) => {
    setActionLoading(queueId);
    setCallNotice("");
    const canPlayLocally = prepareQueueSpeech();
    try {
      const res = await fetch("/api/queues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueId, status: "CALLED", playback: canPlayLocally ? "LOCAL" : "SPEAKER_SCREEN" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memanggil pasien.");
      if (canPlayLocally) {
        try {
          await speakQueueAnnouncement(data.queue.queueNumber, data.queue.roomLabel);
          setCallNotice(`${data.queue.queueNumber} berhasil dipanggil melalui perangkat ini.`);
        } catch (speechError) {
          setCallNotice(speechError instanceof Error ? speechError.message : "Status antrean tersimpan, tetapi suara gagal diputar.");
        }
      } else {
        setCallNotice("Panggilan dikirim ke Layar Speaker karena browser perangkat ini tidak mendukung suara.");
      }
      await fetchQueues();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal memanggil pasien.");
    } finally {
      setActionLoading(null);
    }
  };

  // Stats calculation
  const totalToday = queues.length;
  const waitingCount = queues.filter((q) => q.status === "WAITING").length;
  const inRoomCount = queues.filter((q) => q.status === "IN_ROOM" || q.status === "CALLED").length;
  const completedCount = queues.filter((q) => q.status === "COMPLETED").length;

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  return (
    <AppLayout breadcrumbTitle="Manajemen Antrean Poli" activeNav="/queue">
      <div className="page">
        {loadError && <div role="alert" className="data-error">{loadError}</div>}
        {/* Header Title */}
        <div className="section-header-flex">
          <div>
            <h1 className="page-title">Manajemen Antrean & Kunjungan Hari Ini</h1>
            <p className="page-subtitle">
              Pantau antrean kunjungan hari ini. Pasien lama dicari dari direktori; pasien baru didaftarkan terpisah.
            </p>
          </div>
          <div className="header-actions-group">
            <Link href="/queue/speaker" className="btn-secondary" title="Opsional untuk monitor dan speaker khusus ruang tunggu">
              <Volume2 size={16} /> Layar Speaker (Opsional)
            </Link>
            <button
              type="button"
              className="btn-refresh"
              onClick={fetchQueues}
              title="Perbarui data"
            >
              <RefreshCw size={16} className={loading ? "spinner" : ""} />
              <span>Refresh</span>
            </button>
            {isReceptionist && (
              <Link href="/patients" className="btn-primary-action">
                <UserPlus size={18} />
                <span>Cari Pasien & Buat Kunjungan</span>
              </Link>
            )}
          </div>
        </div>

        {callNotice && <div className="queue-call-notice" role="status"><Volume2 size={16} />{callNotice}</div>}

        {/* Stats Summary Cards */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-icon teal">
              <Users size={19} />
            </div>
            <div>
              <p>Total Antrean Hari Ini</p>
              <strong>{totalToday}</strong>
              <small className="positive">Kunjungan tercatat</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber">
              <Clock size={19} />
            </div>
            <div>
              <p>Pasien Menunggu</p>
              <strong>{waitingCount}</strong>
              <small className="warn">Di ruang tunggu</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Stethoscope size={19} />
            </div>
            <div>
              <p>Sedang Diperiksa</p>
              <strong>{inRoomCount}</strong>
              <small className="positive">Di dalam ruang dokter</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">
              <CheckCircle size={19} />
            </div>
            <div>
              <p>Kunjungan Selesai</p>
              <strong>{completedCount}</strong>
              <small className="positive">Resep diteruskan</small>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="queue-filter-row">
          <div className="filter-group">
            <label htmlFor="dept-filter">Poli:</label>
            <select
              id="dept-filter"
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
            >
              <option value="ALL">Semua Poli</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
            >
              <option value="ALL">Semua Status</option>
              <option value="WAITING">Menunggu</option>
              <option value="CALLED">Dipanggil</option>
              <option value="IN_ROOM">Sedang Diperiksa</option>
              <option value="COMPLETED">Selesai</option>
              <option value="SKIPPED">Dilewati</option>
            </select>
          </div>
        </div>

        {/* Queue Table */}
        <div className="panel table-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">MONITOR ANTREAN LIVE</p>
              <h2>Daftar Pasien Menunggu & Diperiksa ({queues.length})</h2>
            </div>
          </div>

          <div className="table-wrap">
            {loading ? (
              <div className="table-loading">
                <Loader2 size={24} className="spinner" />
                <p>Memuat antrean...</p>
              </div>
            ) : queues.length === 0 ? (
              <div className="table-empty">
                <CalendarDays size={32} />
                <p>Tidak ada antrean yang sesuai dengan filter.</p>
                {isReceptionist && (
                  <Link href="/patients" className="btn-link">
                    Cari pasien atau daftarkan pasien baru
                  </Link>
                )}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>No. Antrean</th>
                    <th>Pasien & RM</th>
                    <th>Poli Tujuan</th>
                    <th>Dokter Pemeriksa</th>
                    <th>Jam Daftar</th>
                    <th>Status Antrean</th>
                    {isReceptionist && <th style={{ textAlign: "right" }}>Aksi Antrean</th>}
                  </tr>
                </thead>
                <tbody>
                  {queues.map((q) => {
                    const isElderly = calculateAge(q.appointment.patient.dateOfBirth) >= 60;
                    const isWithoutPhone = !q.appointment.patient.phone;
                    const isRowBusy = actionLoading === q.id;

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
                                {q.appointment.patient.medicalRecordNo}
                                {isElderly && <span className="badge-elderly">Lansia</span>}
                                {isWithoutPhone && (
                                  <span className="badge-nophone" title="Pasien tanpa HP">
                                    <PhoneOff size={10} /> Tanpa HP
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
                          <span className="doc-name">{q.appointment.doctor.fullName}</span>
                        </td>
                        <td>
                          <span className="time-text">
                            {new Date(q.createdAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${q.status.toLowerCase()}`}>
                            {q.status === "WAITING"
                              ? "Menunggu"
                              : q.status === "CALLED"
                              ? "Dipanggil"
                              : q.status === "IN_ROOM"
                              ? "Sedang Diperiksa"
                              : q.status === "COMPLETED"
                              ? "Selesai"
                              : "Dilewati"}
                          </span>
                        </td>
                        {isReceptionist && <td style={{ textAlign: "right" }}>
                          <div className="action-buttons-group">
                            {(q.status === "WAITING" || q.status === "CALLED") && (
                              <button
                                type="button"
                                className="btn-action-call"
                                disabled={isRowBusy}
                                onClick={() => handleCall(q.id)}
                                title={q.status === "CALLED" ? "Panggil ulang pasien jika belum masuk" : "Panggil pasien"}
                              >
                                <Volume2 size={13} /> {q.status === "CALLED" ? "Panggil Ulang" : "Panggil"}
                              </button>
                            )}

                            {(q.status === "WAITING" || q.status === "CALLED") && (
                              <button
                                type="button"
                                className="btn-action-skip"
                                disabled={isRowBusy}
                                onClick={() => handleUpdateStatus(q.id, "SKIPPED")}
                                title="Tandai tidak hadir / lewati antrean pasien"
                              >
                                Tidak Hadir
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn-action-print"
                              onClick={() => setTicketToPrint(q)}
                              title="Cetak tiket antrean"
                            >
                              <Printer size={13} />
                            </button>
                          </div>
                        </td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {ticketToPrint && <QueueTicket queue={ticketToPrint} onClose={() => setTicketToPrint(null)} />}
      </div>
    </AppLayout>
  );
}
