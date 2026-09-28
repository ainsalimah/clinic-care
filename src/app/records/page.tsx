"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import {
  ClipboardList,
  Search,
  Stethoscope,
  Printer,
  Pill,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PrescriptionItem {
  id: string;
  dosage: string;
  quantity: number;
  instruction: string;
  medicine: {
    name: string;
    form: string | null;
  };
}

interface MedicalRecordItem {
  id: string;
  complaint: string | null;
  physicalExam: string | null;
  diagnosis: string | null;
  treatment: string | null;
  createdAt: string;
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
    department: { name: string };
  };
  prescription?: {
    id: string;
    status: string;
    notes: string | null;
    items: PrescriptionItem[];
  } | null;
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecordItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const fetchRecords = async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/records?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.records) {
        setRecords(data.records);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords("");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords(searchQuery);
  };

  const toggleExpand = (id: string) => {
    setExpandedRecordId(expandedRecordId === id ? null : id);
  };

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  return (
    <AppLayout breadcrumbTitle="Arsip Rekam Medis" activeNav="/records">
      <div className="page">
        {/* Header */}
        <div className="section-header-flex">
          <div>
            <h1 className="page-title">Arsip Rekam Medis Pasien</h1>
            <p className="page-subtitle">
              Riwayat konsultasi klinis, catatan SOAP, diagnosis, dan terapi obat yang pernah diberikan.
            </p>
          </div>
          <Link href="/doctor" className="btn-primary-action">
            <Stethoscope size={16} />
            <span>Ruang Praktik Dokter</span>
          </Link>
        </div>

        {/* Search */}
        <div className="filter-bar">
          <form onSubmit={handleSearch} className="search-form">
            <Search size={18} />
            <input
              type="text"
              placeholder="Cari berdasarkan Nama Pasien, No. RM, Diagnosis (contoh: Gastritis, ISPA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn-search">
              Cari Rekam Medis
            </button>
          </form>
        </div>

        {/* Records List */}
        <div className="records-list-container">
          {loading ? (
            <div className="table-loading">
              <Loader2 size={24} className="spinner" />
              <p>Memuat arsip rekam medis...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="table-empty">
              <ClipboardList size={36} />
              <p>Belum ada catatan rekam medis yang sesuai dengan pencarian.</p>
            </div>
          ) : (
            records.map((rec) => {
              const isExpanded = expandedRecordId === rec.id;
              const hasAllergies =
                rec.patient.allergies && rec.patient.allergies.toLowerCase() !== "tidak ada";

              return (
                <div key={rec.id} className={`record-card ${isExpanded ? "printable" : ""}`}>
                  <div className="record-header" onClick={() => toggleExpand(rec.id)}>
                    <div className="record-meta">
                      <span className="record-date">
                        {new Date(rec.createdAt).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="record-rm">{rec.patient.medicalRecordNo}</span>
                      <b className="record-patient">{rec.patient.fullName}</b>
                      <small style={{ color: "var(--muted)" }}>
                        ({calculateAge(rec.patient.dateOfBirth)} thn, {rec.patient.gender === "MALE" ? "L" : "P"})
                      </small>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span className="record-doc">
                        {rec.doctor.fullName} ({rec.doctor.department.name})
                      </span>
                      <button type="button" className="btn-expand-icon">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Always visible diagnosis teaser */}
                  <div className="record-summary-bar">
                    <div className="summary-diagnosis">
                      <small>DIAGNOSIS:</small>
                      <b>{rec.diagnosis || "Pemeriksaan umum"}</b>
                    </div>
                    {hasAllergies && (
                      <span className="allergy-warn-badge">
                        <AlertTriangle size={11} /> Alergi: {rec.patient.allergies}
                      </span>
                    )}
                  </div>

                  {/* Expanded SOAP Details */}
                  {isExpanded && (
                    <div className="record-details-box">
                      <div className="soap-grid">
                        <div className="soap-box">
                          <b>S (Subjective) — Keluhan:</b>
                          <p>{rec.complaint || "-"}</p>
                        </div>
                        <div className="soap-box">
                          <b>O (Objective) — Pemeriksaan Fisik:</b>
                          <p>{rec.physicalExam || "-"}</p>
                        </div>
                        <div className="soap-box">
                          <b>A (Assessment) — Diagnosis:</b>
                          <p><b>{rec.diagnosis}</b></p>
                        </div>
                        <div className="soap-box">
                          <b>P (Plan) — Tindakan & Terapi:</b>
                          <p>{rec.treatment || "-"}</p>
                        </div>
                      </div>

                      {/* Prescription Details */}
                      {rec.prescription && (
                        <div className="record-rx-box">
                          <div className="rx-header">
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <Pill size={16} color="var(--teal)" />
                              <b>Resep Digital yang Diberikan:</b>
                            </div>
                            <span className={`status-pill ${rec.prescription.status.toLowerCase()}`}>
                              Status Resep: {rec.prescription.status}
                            </span>
                          </div>

                          <table className="rx-table">
                            <thead>
                              <tr>
                                <th>Nama Obat</th>
                                <th>Dosis</th>
                                <th>Jumlah</th>
                                <th>Aturan Pakai</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rec.prescription.items.map((item) => (
                                <tr key={item.id}>
                                  <td>
                                    <b>{item.medicine.name}</b> ({item.medicine.form || "Obat"})
                                  </td>
                                  <td>{item.dosage}</td>
                                  <td>{item.quantity}</td>
                                  <td>{item.instruction}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {rec.prescription.notes && (
                            <small className="rx-note-text">
                              Catatan Apoteker: {rec.prescription.notes}
                            </small>
                          )}
                        </div>
                      )}

                      <div className="record-actions">
                        <button
                          type="button"
                          className="btn-print"
                          onClick={() => window.print()}
                        >
                          <Printer size={15} /> Cetak Lembar Rekam Medis
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
