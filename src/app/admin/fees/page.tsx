"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { fetchJson } from "@/lib/http/client";

type Doctor = { id: string; fullName: string; consultationFee: number };
export default function DoctorFees() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { fetchJson<{ doctors: Doctor[] }>("/api/doctor-fees").then(data => setDoctors(data.doctors)).catch(() => setMessage("Tarif gagal dimuat. Muat ulang halaman.")); }, []);
  async function save(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const fee = Number(new FormData(event.currentTarget).get("fee"));
    setBusy(id); setMessage("");
    try {
      await fetchJson("/api/doctor-fees", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, consultationFee: fee }) });
      setMessage("Tarif tersimpan. Tagihan yang sudah terbit tetap memakai harga sebelumnya.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Tarif gagal disimpan."); }
    finally { setBusy(null); }
  }
  return <AppLayout breadcrumbTitle="Tarif Konsultasi" activeNav="/admin/fees"><div className="page">
    <h1 className="page-title">Tarif Konsultasi Dokter</h1><p className="page-subtitle">Tarif berlaku untuk pemeriksaan yang diselesaikan setelah perubahan disimpan.</p>
    {message && <p role="status" className="portal-notice">{message}</p>}
    <div className="panel">{doctors.map(doctor => <form className="billing-row" key={doctor.id} onSubmit={event => save(event, doctor.id)}>
      <label htmlFor={doctor.id}>{doctor.fullName} · tarif (Rp)</label>
      <input className="form-input" id={doctor.id} name="fee" type="number" min="0" max="2000000000" step="1" required defaultValue={doctor.consultationFee} />
      <button className="btn-primary-action" disabled={busy !== null}>{busy === doctor.id ? "Menyimpan…" : "Simpan tarif"}</button>
    </form>)}</div>
  </div></AppLayout>;
}
