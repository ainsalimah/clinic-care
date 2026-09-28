"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { fetchJson } from "@/lib/http/client";
import {
  Search,
  UserPlus,
  HeartPulse,
  Printer,
  CalendarDays,
  Users,
  Phone,
  PhoneOff,
  Loader2,
  X,
} from "lucide-react";

interface Patient {
  id: string;
  medicalRecordNo: string;
  nik: string | null;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string | null;
  phone: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  createdAt: string;
  appointments: { queue: { queueNumber: string; status: string } | null }[];
}

interface Department {
  id: string;
  name: string;
  doctors: { id: string; fullName: string; specialization: string | null }[];
}

export default function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const isReceptionist = userRole === "RECEPTIONIST";

  // Check-in modal states
  const [selectedPatientForCheckin, setSelectedPatientForCheckin] = useState<Patient | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [notes, setNotes] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinSuccessTicket, setCheckinSuccessTicket] = useState<{
    queueNumber: string;
    departmentName: string;
    doctorName: string;
    patientName: string;
    medicalRecordNo: string;
    time: string;
    date: string;
  } | null>(null);

  const fetchPatients = async (query: string = "") => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchJson<{ patients: Patient[] }>(`/api/patients?q=${encodeURIComponent(query)}`);
      setPatients(data.patients);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Gagal memuat pasien.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialSearch = new URLSearchParams(window.location.search).get("search") || "";
    setSearchQuery(initialSearch);
    fetchPatients(initialSearch);
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUserRole(data.user?.role ?? null))
      .catch(() => setUserRole(null));
    fetchJson<{ departments: Department[] }>("/api/departments")
      .then((data) => {
        if (data.departments) {
          setDepartments(data.departments);
          if (data.departments.length > 0) {
            setSelectedDeptId(data.departments[0].id);
            if (data.departments[0].doctors.length > 0) {
              setSelectedDocId(data.departments[0].doctors[0].id);
            }
          }
        }
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Gagal memuat poli."));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleOpenCheckin = (patient: Patient) => {
    setSelectedPatientForCheckin(patient);
    setCheckinSuccessTicket(null);
    setNotes("");
    if (departments.length > 0) {
      setSelectedDeptId(departments[0].id);
      if (departments[0].doctors.length > 0) {
        setSelectedDocId(departments[0].doctors[0].id);
      }
    }
  };

  const handleDepartmentChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    const dept = departments.find((d) => d.id === deptId);
    if (dept && dept.doctors.length > 0) {
      setSelectedDocId(dept.doctors[0].id);
    } else {
      setSelectedDocId("");
    }
  };

  const handleConfirmCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForCheckin || !selectedDeptId || !selectedDocId) return;

    setCheckinLoading(true);
    try {
      const res = await fetch("/api/queues/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientForCheckin.id,
          departmentId: selectedDeptId,
          doctorId: selectedDocId,
          notes: notes || "Check-in pasien dari direktori",
        }),
      });

      const data = await res.json();
      if (res.ok && data.ticket) {
        setCheckinSuccessTicket(data.ticket);
        await fetchPatients(searchQuery);
      } else {
        alert(data.error || "Gagal check-in");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setCheckinLoading(false);
    }
  };

  const selectedDept = departments.find((d) => d.id === selectedDeptId);

  return (
    <AppLayout breadcrumbTitle="Direktori Data Pasien" activeNav="/patients">
      <div className="page">
        {loadError && <div role="alert" className="data-error">{loadError}</div>}
        {/* Header Action */}
        <div className="section-header-flex">
          <div>
            <h1 className="page-title">Direktori Data Pasien</h1>
            <p className="page-subtitle">
              {isReceptionist
                ? "Cari pasien lama untuk membuat kunjungan, atau daftarkan pasien baru satu kali."
                : "Direktori untuk pencarian dan pemantauan data pasien."}
            </p>
          </div>
          {isReceptionist && (
            <Link href="/patients/new" className="btn-primary-action">
              <UserPlus size={18} />
              <span>Daftar Pasien Baru</span>
            </Link>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="filter-bar">
          <form onSubmit={handleSearch} className="search-form">
            <Search size={18} />
            <input
              type="text"
              placeholder="Cari nama, No. RM, NIK, atau telepon pasien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn-search">
              Cari Pasien
            </button>
          </form>
        </div>

        {/* Patients Table */}
        <div className="panel table-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">DATABASE KLINIK</p>
              <h2>Daftar Pasien Terdaftar ({patients.length})</h2>
            </div>
          </div>

          <div className="table-wrap">
            {loading ? (
              <div className="table-loading">
                <Loader2 size={24} className="spinner" />
                <p>Memuat data pasien...</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="table-empty">
                <Users size={32} />
                <p>Tidak ada data pasien yang cocok dengan pencarian.</p>
                {isReceptionist && (
                  <Link href="/patients/new" className="btn-link">
                    Daftarkan Pasien Baru Sekarang
                  </Link>
                )}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>No. Rekam Medis</th>
                    <th>Nama & Usia Pasien</th>
                    <th>NIK</th>
                    <th>Kontak / Wali</th>
                    {isReceptionist && <th style={{ textAlign: "right" }}>Tindakan</th>}
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => {
                    const age = calculateAge(p.dateOfBirth);
                    const isElderly = age >= 60;
                    const todayQueue = p.appointments[0]?.queue;
                    return (
                      <tr key={p.id}>
                        <td>
                          <b className="queue-num" style={{ fontSize: "13px" }}>
                            {p.medicalRecordNo}
                          </b>
                        </td>
                        <td>
                          <div className="patient-cell">
                            <div className={`avatar-circle ${isElderly ? "elderly" : ""}`}>
                              {p.fullName.charAt(0)}
                            </div>
                            <div>
                              <b className="patient-name">{p.fullName}</b>
                              <small className="patient-meta">
                                {age} tahun ({p.gender === "MALE" ? "Laki-laki" : p.gender === "FEMALE" ? "Perempuan" : "Belum diketahui"})
                                {isElderly && <span className="badge-elderly">Lansia</span>}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="nik-text">{p.nik || "Tidak dicatat"}</span>
                        </td>
                        <td>
                          {p.phone ? (
                            <span className="phone-badge">
                              <Phone size={12} /> {p.phone}
                            </span>
                          ) : p.emergencyContactName ? (
                            <div className="guardian-badge">
                              <small>Wali / Darurat:</small>
                              <span>{p.emergencyContactName}</span>
                              <small>{p.emergencyContactPhone || "-"}</small>
                            </div>
                          ) : (
                            <span className="no-phone">
                              <PhoneOff size={12} /> Tanpa HP
                            </span>
                          )}
                        </td>
                        {isReceptionist && <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className={`btn-checkin ${todayQueue ? "checked-in" : ""}`}
                            onClick={() => { if (!todayQueue) handleOpenCheckin(p); }}
                            disabled={Boolean(todayQueue)}
                            title={todayQueue ? `Sudah check-in: ${todayQueue.queueNumber}` : "Check-in antrean hari ini"}
                          >
                            <CalendarDays size={14} /> {todayQueue ? `Sudah check-in · ${todayQueue.queueNumber}` : "Check-in Antrean"}
                          </button>
                        </td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Check-in Modal */}
        {isReceptionist && selectedPatientForCheckin && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <div>
                  <h3>Check-in Kunjungan Hari Ini</h3>
                  <p>
                    Pasien: <b>{selectedPatientForCheckin.fullName}</b> ({selectedPatientForCheckin.medicalRecordNo})
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setSelectedPatientForCheckin(null)}
                >
                  <X size={18} />
                </button>
              </div>

              {checkinSuccessTicket ? (
                <div className="modal-body success-checkin">
                  <div className="ticket-card printable">
                    <div className="ticket-head">
                      <div className="ticket-brand">
                        <HeartPulse size={18} />
                        <span>KlinikCare — Tiket Antrean</span>
                      </div>
                      <span className="ticket-rm">{checkinSuccessTicket.medicalRecordNo}</span>
                    </div>
                    <div className="ticket-queue-section">
                      <small>NOMOR ANTREAN</small>
                      <div className="queue-big-number">{checkinSuccessTicket.queueNumber}</div>
                      <p>
                        <b>{checkinSuccessTicket.departmentName}</b> • {checkinSuccessTicket.doctorName}
                      </p>
                      <p style={{ marginTop: "4px", fontSize: "13px" }}>
                        Pasien: <b>{checkinSuccessTicket.patientName}</b>
                      </p>
                      <small>{checkinSuccessTicket.date} • {checkinSuccessTicket.time} WIB</small>
                    </div>
                    <div className="ticket-actions">
                      <button
                        type="button"
                        className="btn-print"
                        onClick={() => window.print()}
                      >
                        <Printer size={15} /> Cetak Tiket Antrean
                      </button>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setSelectedPatientForCheckin(null)}
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConfirmCheckin} className="modal-body">
                  <div className="form-group">
                    <label htmlFor="dept-checkin">Poli Tujuan:</label>
                    <select
                      id="dept-checkin"
                      value={selectedDeptId}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="doc-checkin">Dokter Pemeriksa:</label>
                    <select
                      id="doc-checkin"
                      value={selectedDocId}
                      onChange={(e) => setSelectedDocId(e.target.value)}
                    >
                      {selectedDept?.doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.fullName} {doc.specialization ? `(${doc.specialization})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes-checkin">Keluhan utama (opsional):</label>
                    <input
                      id="notes-checkin"
                      type="text"
                      placeholder="Keluhan utama pasien hari ini"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setSelectedPatientForCheckin(null)}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={checkinLoading}
                    >
                      {checkinLoading ? (
                        <>
                          <Loader2 size={16} className="spinner" />
                          <span>Menerbitkan Antrean...</span>
                        </>
                      ) : (
                        "Konfirmasi & Terbitkan Nomor"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
