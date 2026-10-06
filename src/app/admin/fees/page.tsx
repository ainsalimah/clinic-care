"use client";

import { useEffect, useState } from "react";
import { BadgeDollarSign, Save, Stethoscope } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { fetchJson } from "@/lib/http/client";

type Doctor = { id: string; fullName: string; consultationFee: number };

export default function DoctorFees() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJson<{ doctors: Doctor[] }>("/api/doctor-fees")
      .then((data) => setDoctors(data.doctors))
      .catch(() => setError("Tarif gagal dimuat. Muat ulang halaman."))
      .finally(() => setLoading(false));
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const fee = Number(new FormData(event.currentTarget).get("fee"));
    setBusy(id);
    setMessage("");
    setError("");
    try {
      await fetchJson("/api/doctor-fees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, consultationFee: fee }),
      });
      setMessage("Tarif tersimpan. Tagihan yang sudah terbit tetap memakai harga sebelumnya.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Tarif gagal disimpan.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppLayout breadcrumbTitle="Tarif Konsultasi" activeNav="/admin/fees">
      <div className="page">
        <div className="section-header-flex">
          <div>
            <p className="eyebrow">ADMINISTRASI TARIF</p>
            <h1 className="page-title">Tarif Konsultasi Dokter</h1>
            <p className="page-subtitle">Perubahan berlaku untuk pemeriksaan yang diselesaikan setelah tarif disimpan.</p>
          </div>
        </div>

        {message && <p role="status" className="portal-notice">{message}</p>}
        {error && <p role="alert" className="data-error">{error}</p>}

        <section className="panel max-w-3xl" aria-labelledby="fee-list-title">
          <div className="flex items-start gap-3 border-b border-[#E8EEF2] pb-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F3FC] text-[#2F80C0]">
              <BadgeDollarSign size={21} aria-hidden="true" />
            </span>
            <div>
              <h2 id="fee-list-title" className="text-lg font-bold">Daftar Tarif Aktif</h2>
              <p className="mt-1 text-sm text-[#5B7284]">Simpan perubahan per dokter untuk menghindari perubahan tarif yang tidak disengaja.</p>
            </div>
          </div>

          {loading ? <p className="admin-empty-state" role="status">Memuat tarif konsultasi...</p> : doctors.length ? doctors.map((doctor) => (
            <form className="billing-row" key={doctor.id} onSubmit={(event) => save(event, doctor.id)}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E2F2FC] text-[#145B88]">
                  <Stethoscope size={17} aria-hidden="true" />
                </span>
                <label htmlFor={doctor.id}>{doctor.fullName}<span className="text-xs font-normal text-[#71899B]">Tarif konsultasi saat ini</span></label>
              </div>
              <input className="form-input" id={doctor.id} name="fee" type="number" min="0" max="2000000000" step="1" required defaultValue={doctor.consultationFee} aria-label={`Tarif konsultasi ${doctor.fullName}`} />
              <button className="btn-primary-action" disabled={busy !== null}>
                <Save size={16} aria-hidden="true" />
                {busy === doctor.id ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          )) : !error && <p className="admin-empty-state">Belum ada dokter yang memiliki tarif konsultasi.</p>}
        </section>
      </div>
    </AppLayout>
  );
}
