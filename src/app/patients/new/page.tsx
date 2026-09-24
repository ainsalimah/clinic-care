"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { AlertCircle, ArrowLeft, CheckCircle2, HeartPulse, Loader2, Printer, UserPlus } from "lucide-react";

interface RegisteredPatient {
  id: string;
  fullName: string;
  medicalRecordNo: string;
  nik: string | null;
  dateOfBirth: string;
  gender: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successPatient, setSuccessPatient] = useState<RegisteredPatient | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [duplicateNIK, setDuplicateNIK] = useState(false);
  const [fullName, setFullName] = useState("");
  const [nik, setNik] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [allergies, setAllergies] = useState("");

  const resetForm = () => {
    setSuccessPatient(null);
    setErrorMessage("");
    setDuplicateNIK(false);
    setFullName("");
    setNik("");
    setDateOfBirth("");
    setGender("");
    setAddress("");
    setPhone("");
    setEmergencyContactName("");
    setEmergencyContactPhone("");
    setAllergies("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setDuplicateNIK(false);
    setLoading(true);
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          nik: nik || null,
          dateOfBirth,
          gender,
          address: address || null,
          phone: phone || null,
          emergencyContactName: emergencyContactName || null,
          emergencyContactPhone: emergencyContactPhone || null,
          allergies: allergies || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "Gagal mendaftarkan pasien.");
        setDuplicateNIK(response.status === 409 && Boolean(nik));
        return;
      }
      setSuccessPatient(data.patient);
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan saat mendaftarkan pasien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout breadcrumbTitle="Daftarkan Pasien" activeNav="/patients">
      <div className="page">
        <div className="section-header-flex">
          <div>
            <Link href="/patients" className="btn-back"><ArrowLeft size={16} /> Kembali ke Data Pasien</Link>
            <h1 className="page-title">Daftarkan Pasien Baru</h1>
            <p className="page-subtitle">Pendaftaran membuat rekam pasien. Kunjungan dan antrean dibuat terpisah saat pasien datang.</p>
          </div>
        </div>

        {successPatient ? (
          <div className="success-box">
            <div className="success-badge-icon"><CheckCircle2 size={36} /></div>
            <h2>Pasien berhasil didaftarkan</h2>
            <p>Nomor rekam medis pasien sudah dibuat. Tidak ada kunjungan atau antrean yang dibuat pada langkah ini.</p>
            <div className="ticket-card printable">
              <div className="ticket-head">
                <div className="ticket-brand"><HeartPulse size={20} /><span>KlinikCare — Kartu Pasien</span></div>
                <span className="ticket-rm">{successPatient.medicalRecordNo}</span>
              </div>
              <div className="ticket-body">
                <div className="ticket-row"><span>Nama:</span><b>{successPatient.fullName}</b></div>
                {successPatient.nik && <div className="ticket-row"><span>NIK:</span><b>{successPatient.nik}</b></div>}
                <div className="ticket-row"><span>Tanggal lahir:</span><b>{new Date(successPatient.dateOfBirth).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</b></div>
                {successPatient.emergencyContactName && <div className="ticket-row"><span>Kontak pendamping:</span><b>{successPatient.emergencyContactName} · {successPatient.emergencyContactPhone || "nomor belum dicatat"}</b></div>}
              </div>
              <div className="ticket-actions"><button type="button" className="btn-print" onClick={() => window.print()}><Printer size={16} /> Cetak Kartu Pasien</button></div>
            </div>
            <div className="success-action-buttons">
              <button type="button" className="btn-secondary" onClick={resetForm}><UserPlus size={16} /> Daftarkan Pasien Lain</button>
              <button type="button" className="btn-primary" onClick={() => router.push(`/patients?search=${encodeURIComponent(successPatient.medicalRecordNo)}`)}>Cari pasien ini untuk membuat kunjungan</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="patient-form-grid">
            {errorMessage && <div className="login-alert form-col-span"><AlertCircle size={18} /><span>{errorMessage}{duplicateNIK && <> <Link href={`/patients?search=${encodeURIComponent(nik)}`}>Cari pasien yang sudah terdaftar</Link></>}</span></div>}
            <div className="form-panel form-col-span">
              <div className="panel-title"><UserPlus size={18} /><h3>Identitas pasien</h3></div>
              <p className="field-hint">Isi data ini sekali saat pasien pertama kali terdaftar. Untuk pasien lama, cari nomor rekam medis di Data Pasien.</p>
              <div className="form-group">
                <label htmlFor="fullName">Nama lengkap <span className="req">*</span></label>
                <input id="fullName" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nama sesuai identitas" />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Tanggal lahir <span className="req">*</span></label>
                  <input id="dateOfBirth" type="date" required value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Jenis kelamin <span className="req">*</span></label>
                  <select id="gender" required value={gender} onChange={(event) => setGender(event.target.value)}>
                    <option value="">Pilih</option><option value="MALE">Laki-laki</option><option value="FEMALE">Perempuan</option><option value="UNKNOWN">Belum diketahui</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="nik">NIK <span className="field-hint">Opsional</span></label>
                <input id="nik" inputMode="numeric" maxLength={16} value={nik} onChange={(event) => setNik(event.target.value.replace(/\D/g, ""))} placeholder="16 digit jika tersedia" />
              </div>
            </div>

            <details className="form-panel form-col-span optional-patient-details">
              <summary>Data tambahan <span>(opsional)</span></summary>
              <div className="form-group">
                <label htmlFor="phone">Telepon pasien</label>
                <input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Nomor yang bisa dihubungi" />
              </div>
              <div className="form-group">
                <label htmlFor="address">Alamat</label>
                <textarea id="address" rows={2} autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Alamat pasien" />
              </div>
              <p className="field-hint">Kontak pendamping hanya dicatat bila pasien ingin atau membutuhkan orang lain untuk dihubungi.</p>
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="emergencyContactName">Nama kontak pendamping</label>
                  <input id="emergencyContactName" value={emergencyContactName} onChange={(event) => setEmergencyContactName(event.target.value)} placeholder="Nama keluarga / wali" />
                </div>
                <div className="form-group">
                  <label htmlFor="emergencyContactPhone">Telepon kontak pendamping</label>
                  <input id="emergencyContactPhone" type="tel" value={emergencyContactPhone} onChange={(event) => setEmergencyContactPhone(event.target.value)} placeholder="Nomor telepon" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="allergies">Catatan alergi yang diketahui</label>
                <textarea id="allergies" rows={2} value={allergies} onChange={(event) => setAllergies(event.target.value)} placeholder="Opsional; akan dikonfirmasi lagi saat kunjungan" />
              </div>
            </details>

            <div className="form-actions form-col-span">
              <button type="submit" className="btn-submit-patient" disabled={loading}>
                {loading ? <><Loader2 size={18} className="spinner" /> Menyimpan data pasien...</> : <><UserPlus size={18} /> Daftarkan Pasien</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
