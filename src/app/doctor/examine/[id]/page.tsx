"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { AutoCallNotice } from "@/features/queue/components/AutoCallNotice";
import {
  AlertTriangle,
  FileText,
  Pill,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Clock,
  User,
  ShieldAlert,
  Send,
} from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  form: string | null;
  unit: string;
  stock: number;
}

interface PastRecord {
  id: string;
  complaint: string | null;
  diagnosis: string | null;
  treatment: string | null;
  createdAt: string;
  doctor: {
    fullName: string;
  };
  prescription?: {
    items: {
      medicine: { name: string };
      dosage: string;
      quantity: number;
      instruction: string;
    }[];
  } | null;
}

interface AppointmentDetail {
  id: string;
  notes: string | null;
  appointmentDate: string;
  department: { name: string };
  doctor: { fullName: string; specialization: string | null };
  queue?: { queueNumber: string; status: string } | null;
  patient: {
    id: string;
    fullName: string;
    medicalRecordNo: string;
    dateOfBirth: string;
    gender: string;
    address: string | null;
    phone: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    allergies: string | null;
    records: PastRecord[];
  };
}

interface PrescriptionItemInput {
  medicineId: string;
  dosage: string;
  quantity: number;
  instruction: string;
}

interface AutoCall {
  id: string;
  dueAt: string;
  cancelledAt: string | null;
  processedAt: string | null;
  calledQueueId: string | null;
}

export default function DoctorExaminationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: appointmentId } = use(params);

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [autoCall, setAutoCall] = useState<AutoCall | null>(null);

  // SOAP state
  const [complaint, setComplaint] = useState("");
  const [vitalBloodPressure, setVitalBloodPressure] = useState("120/80");
  const [vitalHeartRate, setVitalHeartRate] = useState("78");
  const [vitalTemperature, setVitalTemperature] = useState("36.6");
  const [physicalExamNotes, setPhysicalExamNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");

  // Prescription state
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemInput[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");

  useEffect(() => {
    // 1. Fetch appointment details
    fetch(`/api/doctor/examination/${appointmentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.appointment) {
          setAppointment(data.appointment);
          if (data.appointment.notes) {
            setComplaint(data.appointment.notes);
          }
        } else {
          setErrorMessage(data.error || "Data pemeriksaan tidak ditemukan.");
        }
      })
      .catch(() => setErrorMessage("Gagal memuat data pemeriksaan."))
      .finally(() => setLoading(false));

    // 2. Fetch available medicines in pharmacy
    fetch("/api/medicines")
      .then((res) => res.json())
      .then((data) => {
        if (data.medicines) setMedicines(data.medicines);
      })
      .catch(() => {});
  }, [appointmentId]);

  const handleAddMedicine = () => {
    if (medicines.length === 0) return;
    setPrescriptionItems([
      ...prescriptionItems,
      {
        medicineId: medicines[0].id,
        dosage: "1 tablet",
        quantity: 10,
        instruction: "3x sehari 1 tablet sesudah makan",
      },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof PrescriptionItemInput,
    value: string | number
  ) => {
    const updated = [...prescriptionItems];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptionItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setErrorMessage("Diagnosis wajib diisi sebelum menyelesaikan pemeriksaan.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const fullPhysicalExam = `TD: ${vitalBloodPressure} mmHg, Nadi: ${vitalHeartRate}x/mnt, Suhu: ${vitalTemperature}°C. ${physicalExamNotes}`.trim();

    try {
      const res = await fetch("/api/doctor/examination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          complaint,
          physicalExam: fullPhysicalExam,
          diagnosis,
          treatment,
          prescriptionItems,
          prescriptionNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Gagal menyimpan rekam medis.");
        setSubmitting(false);
        return;
      }

      setAutoCall(data.autoCall ?? null);
      setSuccess(true);
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan.");
      setSubmitting(false);
    }
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return 0;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  if (loading) {
    return (
      <AppLayout breadcrumbTitle="Pemeriksaan Dokter" activeNav="/doctor">
        <div className="page" style={{ textAlign: "center", padding: "80px 20px" }}>
          <Loader2 size={36} className="spinner" style={{ margin: "0 auto 16px", color: "var(--teal)" }} />
          <p>Memuat rekam data pasien & ruang periksa...</p>
        </div>
      </AppLayout>
    );
  }

  if (success) {
    return (
      <AppLayout breadcrumbTitle="Pemeriksaan Selesai" activeNav="/doctor">
        <div className="page">
          <div className="success-box">
            <div className="success-badge-icon">
              <CheckCircle2 size={40} />
            </div>
            <h2>Pemeriksaan Berhasil Diselesaikan!</h2>
            <p>
              Rekam medis telah tersimpan. Arahkan pasien ke kasir apotek untuk membayar konsultasi dan obat, termasuk bila tidak ada resep. Resep yang dibuat diteruskan ke apoteker untuk disiapkan.
            </p>
            {autoCall && <AutoCallNotice initialCall={autoCall} appointmentId={appointmentId} />}

            <div className="success-action-buttons" style={{ marginTop: "24px" }}>
              <Link href="/doctor" className="btn-primary">
                Kembali ke Antrean Pasien
              </Link>
              <Link href="/records" className="btn-secondary">
                Lihat Arsip Rekam Medis
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!appointment) {
    return (
      <AppLayout breadcrumbTitle="Pemeriksaan Dokter" activeNav="/doctor">
        <div className="page">
          <div className="login-alert">
            <AlertTriangle size={18} />
            <span>{errorMessage || "Data tidak ditemukan."}</span>
          </div>
          <Link href="/doctor" className="btn-back">
            <ArrowLeft size={16} /> Kembali ke Antrean
          </Link>
        </div>
      </AppLayout>
    );
  }

  const patient = appointment.patient;
  const hasAllergies = patient.allergies && patient.allergies.toLowerCase() !== "tidak ada";

  return (
    <AppLayout breadcrumbTitle="Ruang Periksa Dokter" activeNav="/doctor">
      <div className="page">
        {/* Top bar header */}
        <div className="section-header-flex">
          <div>
          <Link href="/doctor" className="btn-back">
              <ArrowLeft size={16} /> Kembali ke Daftar Antrean
            </Link>
            <h1 className="page-title">
              Pemeriksaan Pasien: {patient.fullName}
            </h1>
            <p className="page-subtitle">
              Poli: <b>{appointment.department.name}</b> • Pemeriksa: <b>{appointment.doctor.fullName}</b>
              {appointment.queue && (
                <> • No. Antrean: <span className="queue-num" style={{ fontSize: "14px" }}>{appointment.queue.queueNumber}</span></>
              )}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="login-alert" style={{ marginBottom: "20px" }}>
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2 Column Layout */}
        <div className="patient-form-grid examination-grid">
          {/* Left Column: Patient Profile & Allergies & Past History */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Allergy Banner (Crucial Safety Feature) */}
            {hasAllergies ? (
              <div className="allergy-alert-card">
                <div className="allergy-alert-head">
                  <ShieldAlert size={20} />
                  <b>PERINGATAN ALERGI OBAT</b>
                </div>
                <p>{patient.allergies}</p>
                <small>Hati-hati saat meresepkan obat antibiotik atau golongan sejenis.</small>
              </div>
            ) : (
              <div className="allergy-safe-card">
                <CheckCircle2 size={16} />
                <span>Tidak ada catatan riwayat alergi obat</span>
              </div>
            )}

            {/* Patient Info Card */}
            <div className="form-panel">
              <div className="panel-title">
                <User size={18} />
                <h3>Biodata Pasien</h3>
              </div>
              <div className="info-list">
                <div className="info-row">
                  <span>No. Rekam Medis:</span>
                  <b>{patient.medicalRecordNo}</b>
                </div>
                <div className="info-row">
                  <span>Usia / Gender:</span>
                  <span>
                    {calculateAge(patient.dateOfBirth)} tahun ({patient.gender === "MALE" ? "L" : "P"})
                  </span>
                </div>
                <div className="info-row">
                  <span>Tanggal Lahir:</span>
                  <span>
                    {new Date(patient.dateOfBirth).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {patient.address && (
                  <div className="info-row">
                    <span>Domisili:</span>
                    <span>{patient.address}</span>
                  </div>
                )}
                {patient.emergencyContactName && (
                  <div className="info-row">
                    <span>Kontak Wali / Darurat:</span>
                    <span>
                      {patient.emergencyContactName} ({patient.emergencyContactPhone || "-"})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Past Visits / Medical History */}
            <div className="form-panel">
              <div className="panel-title">
                <Clock size={18} />
                <h3>Riwayat Kunjungan Terdahulu</h3>
              </div>
              {patient.records.length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: ".875rem", margin: "8px 0" }}>
                  Ini adalah kunjungan pertama pasien di sistem KlinikCare.
                </p>
              ) : (
                <div className="history-list">
                  {patient.records.map((rec) => (
                    <div key={rec.id} className="history-item">
                      <div className="history-date">
                        {new Date(rec.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })} • {rec.doctor.fullName}
                      </div>
                      <b>{rec.diagnosis || "Pemeriksaan umum"}</b>
                      {rec.complaint && <p>Keluhan: {rec.complaint}</p>}
                      {rec.prescription && rec.prescription.items.length > 0 && (
                        <div className="history-rx">
                          <small>Resep:</small>{" "}
                          {rec.prescription.items.map((i) => i.medicine.name).join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: SOAP Examination & Digital Prescription */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* SOAP Notes Card */}
            <div className="form-panel">
              <div className="panel-title">
                <FileText size={18} />
                <h3>Formulir Pemeriksaan Medis (SOAP)</h3>
              </div>

              {/* S: Subjective */}
              <div className="form-group">
                <label htmlFor="complaint">
                  <b>S (Subjective)</b> — Keluhan Utama & Riwayat Penyakit Sekarang <span className="req">*</span>
                </label>
                <textarea
                  id="complaint"
                  rows={2}
                  required
                  placeholder="Keluhan yang dirasakan pasien, durasi gejala, faktor yang memperberat/memperingan..."
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                />
              </div>

              {/* O: Objective */}
              <div className="form-group">
                <label>
                  <b>O (Objective)</b> — Tanda Vital & Pemeriksaan Fisik
                </label>
                <div className="vitals-grid">
                  <div className="vital-field">
                    <label htmlFor="vital-pressure">Tekanan darah</label>
                    <input
                      id="vital-pressure"
                      type="text"
                      placeholder="120/80"
                      value={vitalBloodPressure}
                      onChange={(e) => setVitalBloodPressure(e.target.value)}
                    />
                    <span>mmHg</span>
                  </div>
                  <div className="vital-field">
                    <label htmlFor="vital-heart-rate">Detak jantung</label>
                    <input
                      id="vital-heart-rate"
                      type="text"
                      placeholder="78"
                      value={vitalHeartRate}
                      onChange={(e) => setVitalHeartRate(e.target.value)}
                    />
                    <span>bpm</span>
                  </div>
                  <div className="vital-field">
                    <label htmlFor="vital-temperature">Suhu tubuh</label>
                    <input
                      id="vital-temperature"
                      type="text"
                      placeholder="36.6"
                      value={vitalTemperature}
                      onChange={(e) => setVitalTemperature(e.target.value)}
                    />
                    <span>°C</span>
                  </div>
                </div>

                <textarea
                  aria-label="Hasil pemeriksaan fisik"
                  style={{ marginTop: "10px" }}
                  rows={2}
                  placeholder="Hasil pemeriksaan kepala, toraks, abdomen, ekstremitas, dsb."
                  value={physicalExamNotes}
                  onChange={(e) => setPhysicalExamNotes(e.target.value)}
                />
              </div>

              {/* A: Assessment */}
              <div className="form-group">
                <label htmlFor="diagnosis">
                  <b>A (Assessment)</b> — Diagnosis Klinis / ICD-10 <span className="req">*</span>
                </label>
                <input
                  id="diagnosis"
                  type="text"
                  required
                  placeholder="Contoh: K29.7 Gastritis Akut / J06.9 Infeksi Saluran Pernapasan Atas"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              {/* P: Plan */}
              <div className="form-group">
                <label htmlFor="treatment">
                  <b>P (Plan)</b> — Rencana Tindakan, Edukasi Pasien, & Kontrol
                </label>
                <textarea
                  id="treatment"
                  rows={2}
                  placeholder="Tindakan medis yang dilakukan, edukasi istirahat, anjuran pola makan, jadwal kontrol berikutnya..."
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                />
              </div>
            </div>

            {/* Digital Prescription Builder */}
            <div className="form-panel">
              <div className="panel-title" style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Pill size={18} />
                  <h3>Resep Digital (E-Prescription)</h3>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: "6px 12px", fontSize: ".875rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={handleAddMedicine}
                >
                  <Plus size={14} /> Tambah Obat
                </button>
              </div>

              {prescriptionItems.length === 0 ? (
                <div className="empty-rx-box">
                  <Pill size={24} />
                  <p>Belum ada obat yang ditambahkan ke resep.</p>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: ".875rem", padding: "6px 14px" }}
                    onClick={handleAddMedicine}
                  >
                    + Klik untuk Tambah Obat
                  </button>
                </div>
              ) : (
                <div className="rx-items-list">
                  {prescriptionItems.map((item, index) => {
                    const selectedMed = medicines.find((m) => m.id === item.medicineId);
                    const isAllergyConflict =
                      hasAllergies &&
                      selectedMed &&
                      patient.allergies?.toLowerCase().includes(selectedMed.name.toLowerCase().split(" ")[0]);

                    return (
                      <div key={index} className="rx-item-card">
                        <div className="rx-item-row">
                          {/* Medicine selection */}
                          <div className="rx-medicine-field">
                            <label htmlFor={`medicine-${index}`}>Nama obat</label>
                            <select
                              id={`medicine-${index}`}
                              value={item.medicineId}
                              onChange={(e) => handleItemChange(index, "medicineId", e.target.value)}
                            >
                              {medicines.map((med) => (
                                <option key={med.id} value={med.id}>
                                  {med.name} ({med.form || "Obat"}) — Stok: {med.stock} {med.unit}
                                </option>
                              ))}
                            </select>
                            {isAllergyConflict && (
                              <div className="rx-allergy-warn">
                                <AlertTriangle size={12} />
                                <span>Peringatan: Pasien tercatat alergi obat ini!</span>
                              </div>
                            )}
                          </div>

                          {/* Dosage */}
                          <div className="rx-dosage-field">
                            <label htmlFor={`dosage-${index}`}>Dosis</label>
                            <input
                              id={`dosage-${index}`}
                              type="text"
                              placeholder="500mg / 1 tablet"
                              value={item.dosage}
                              onChange={(e) => handleItemChange(index, "dosage", e.target.value)}
                            />
                          </div>

                          {/* Quantity */}
                          <div className="rx-quantity-field">
                            <label htmlFor={`quantity-${index}`}>Jumlah</label>
                            <input
                              id={`quantity-${index}`}
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                            />
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            className="btn-trash"
                            onClick={() => handleRemoveMedicine(index)}
                            title="Hapus obat"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Instructions */}
                        <div style={{ marginTop: "8px" }}>
                          <label htmlFor={`instruction-${index}`}>Aturan pakai dan signa</label>
                          <input
                            id={`instruction-${index}`}
                            type="text"
                            placeholder="Contoh: 3x sehari 1 tablet sesudah makan"
                            value={item.instruction}
                            onChange={(e) => handleItemChange(index, "instruction", e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="form-group" style={{ marginTop: "12px" }}>
                <label htmlFor="prescriptionNotes">Catatan Tambahan untuk Apoteker:</label>
                <input
                  id="prescriptionNotes"
                  type="text"
                  placeholder="Misal: Minum saat perut kosong, atau beri tahu jika mual"
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="btn-submit-consultation"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    <span>Menyimpan & Meneruskan ke Apotek...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Selesaikan Pemeriksaan & Kirim Resep ke Apotek</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
