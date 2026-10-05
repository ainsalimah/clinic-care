"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { PublicDoctor } from "./DoctorDirectorySection";

export function AppointmentFormSection({ doctors, preselectedService }: { doctors: PublicDoctor[]; preselectedService?: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (preselectedService) {
      setService(preselectedService);
    }
  }, [preselectedService]);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const digits = trimmedPhone.replace(/\D/g, "");

    if (!trimmedName) {
      setErrorMsg("Mohon masukkan nama lengkap Anda.");
      return;
    }
    if (!trimmedPhone || digits.length < 8 || digits.length > 15) {
      setErrorMsg("Nomor telepon tidak valid (masukkan 8–15 digit angka).");
      return;
    }
    if (!service) {
      setErrorMsg("Mohon pilih dokter atau layanan yang dituju.");
      return;
    }
    if (!date || date < todayStr) {
      setErrorMsg("Mohon pilih tanggal kunjungan yang valid (hari ini atau mendatang).");
      return;
    }

    setIsBusy(true);
    setTimeout(() => {
      setIsBusy(false);
      setIsSuccess(true);
    }, 700);
  };

  const handleReset = () => {
    setName("");
    setPhone("");
    setService("");
    setDate("");
    setErrorMsg(null);
  };

  return (
    <section id="janji" className="pad mesh">
      <div className="wrap grid lg:grid-cols-[.8fr_1.2fr] gap-12">
        <div>
          <p className="eyebrow mb-3 text-[#2F80C0]">BUAT JANJI</p>
          <h2 className="text-[#0B2D45] font-extrabold text-2xl sm:text-3xl">
            Mari Rencanakan Kunjungan Anda
          </h2>
          <p className="mt-5 text-[#315066] text-base leading-relaxed">
            Kirim permintaan kunjungan untuk dokter atau layanan pilihan Anda. Jadwal baru dipastikan setelah konfirmasi tim pendaftaran.
          </p>
          <p className="mt-4 font-semibold text-[#0B2D45] text-base">
            Senin–Sabtu, 08.00–20.00
          </p>
          <a
            href="tel:+62215557799"
            className="btn bg-[#0B2D45] text-white mt-6 !inline-flex"
          >
            Darurat? Telepon IGD
          </a>
        </div>

        <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-lg border border-[#d5e2eb]">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} onReset={handleReset}>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="font-bold text-base text-[#0B2D45]">
                    Nama Lengkap
                  </label>
                  <input
                    id="name"
                    required
                    maxLength={100}
                    autoComplete="name"
                    className="canva-input"
                    placeholder="Contoh: Rina Maheswari"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="font-bold text-base text-[#0B2D45]">
                    Nomor Telepon
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    maxLength={25}
                    autoComplete="tel"
                    className="canva-input"
                    placeholder="Contoh: 08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="service" className="font-bold text-base text-[#0B2D45]">
                    Dokter atau Layanan
                  </label>
                  <select
                    id="service"
                    required
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  >
                    <option value="">Pilih dokter atau layanan</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.fullName} ({doctor.specialization ?? doctor.department.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="appointment_date" className="font-bold text-base text-[#0B2D45]">
                    Tanggal yang Diinginkan
                  </label>
                  <input
                    id="appointment_date"
                    type="date"
                    required
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <p className="mt-5 text-[#4c6475] text-xs sm:text-sm">
                Formulir ini hanya untuk administrasi kunjungan. Jangan sertakan informasi medis atau data sensitif.
              </p>

              {errorMsg && (
                <p className="mt-4 text-red-700 bg-red-50 p-3 rounded-xl text-sm font-semibold" role="alert">
                  {errorMsg}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="btn flex-1 text-white font-bold"
                >
                  {isBusy ? "Mengirim Permintaan…" : "Kirim Permintaan Janji"}
                </button>
                <button
                  type="reset"
                  className="btn outline-btn font-bold"
                >
                  Atur Ulang
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 size={48} className="text-[#2F80C0] mx-auto" />
              <h3 className="font-bold text-2xl text-[#0B2D45] mt-4">
                Permintaan Tersimpan
              </h3>
              <p className="mt-4 text-[#4c6475] text-base leading-relaxed max-w-md mx-auto">
                Permintaan janji temu Anda telah dicatat dalam sistem. Tim admisi RS Cakrawala Medika akan menghubungi nomor telepon Anda untuk mengonfirmasi jadwal definitif.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  handleReset();
                }}
                className="btn mt-6 font-bold"
              >
                Kembali ke Formulir
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
