/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { getDoctorImage, weekdayNames } from "../content";

export interface PublicDoctor {
  id: string;
  fullName: string;
  specialization: string | null;
  department: { name: string };
  schedules: { dayOfWeek: number; startTime: string; endTime: string }[];
}

function formatSchedule(doctor: PublicDoctor) {
  if (!doctor.schedules.length) return "Jadwal praktik sedang diperbarui";
  return doctor.schedules.map((schedule) => `${weekdayNames[schedule.dayOfWeek]} ${schedule.startTime}-${schedule.endTime}`).join(" | ");
}

export function DoctorDirectorySection({ doctors, onSelectDoctor }: { doctors: PublicDoctor[]; onSelectDoctor?: (doctorId: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [expandedProfiles, setExpandedProfiles] = useState<Record<string, boolean>>({});

  const toggleProfile = (id: string) => {
    setExpandedProfiles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredDoctors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return doctors.filter((doc) => {
      const specialty = doc.specialization ?? doc.department.name;
      const matchName = doc.fullName.toLowerCase().includes(q) || specialty.toLowerCase().includes(q) || doc.department.name.toLowerCase().includes(q);
      const matchSpecialty = !selectedSpecialty || doc.department.name === selectedSpecialty;
      return matchName && matchSpecialty;
    });
  }, [doctors, searchQuery, selectedSpecialty]);

  return (
    <section id="dokter" className="pad grid-bg">
      <div className="wrap">
        <div className="flex flex-wrap justify-between items-center gap-7">
          <div className="max-w-2xl">
            <p className="eyebrow text-[#2F80C0] mb-3">TIM MEDIS KAMI</p>
            <h2 className="text-[#0B2D45] font-extrabold text-2xl sm:text-3xl">
              Temukan Pendamping Kesehatan Anda
            </h2>
            <p className="mt-4 text-[#315066] text-base leading-relaxed">
              Kenali dokter yang aktif, telusuri jadwal praktik, dan ajukan kunjungan melalui direktori dokter.
            </p>
          </div>
          <a href="#janji" className="btn bg-[#0B2D45] text-white !py-3 !px-6">
            Pendaftaran Janji
          </a>
        </div>

        {/* Filter Bar */}
        <div className="grid md:grid-cols-2 gap-5 mt-8">
          <div>
            <label htmlFor="doctor-search" className="font-bold text-base text-[#0B2D45]">
              Cari Nama Dokter
            </label>
            <input
              id="doctor-search"
              type="search"
              autoComplete="off"
              className="canva-input mt-2"
              placeholder="Ketik nama dokter atau spesialisasi"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="specialty-filter" className="font-bold text-base text-[#0B2D45]">
              Filter Spesialisasi
            </label>
            <select
              id="specialty-filter"
              className="mt-2"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              <option value="">Semua Spesialisasi</option>
              {[...new Set(doctors.map((doctor) => doctor.department.name))].map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
          </div>
        </div>

        <p className="mt-5 text-[#315066] font-semibold text-sm sm:text-base">
          {filteredDoctors.length} dokter ditemukan
        </p>

        {filteredDoctors.length === 0 && (
          <div className="mt-6 p-8 bg-white rounded-2xl text-center border border-[#d5e2eb]">
            <p className="text-[#315066] font-medium">
              Tidak ada dokter yang cocok dengan pencarian Anda. Coba kata kunci lain atau pilih semua spesialisasi.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredDoctors.map((doc) => {
            const isExpanded = !!expandedProfiles[doc.id];
            return (
              <article key={doc.id} className="doctor-card">
                <img
                  src={getDoctorImage(doc.fullName, doc.department.name)}
                  alt={"Foto ilustrasi " + doc.fullName}
                  loading="lazy"
                />
                <div className="doctor-copy">
                  <h3 className="font-bold text-lg text-[#0B2D45]">{doc.fullName}</h3>
                  <p className="role">{doc.specialization ?? doc.department.name}</p>
                  <p className="schedule">{formatSchedule(doc)}</p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      type="button"
                      className="btn outline-btn !py-2 !px-3.5 !text-sm"
                      onClick={() => toggleProfile(doc.id)}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "Tutup Profil" : "Lihat Profil"}
                    </button>
                    <a
                      href="#janji"
                      className="btn !py-2 !px-3.5 !text-sm"
                      onClick={() => onSelectDoctor?.(doc.id)}
                    >
                      Buat Janji
                    </a>
                  </div>

                  {isExpanded && (
                    <div className="profile animate-fadeIn">
                      <h4 className="font-bold text-sm text-[#0B2D45]">Pendekatan Pelayanan</h4>
                      <p className="mt-2 text-xs text-[#4c6475] leading-relaxed">
                        Bertugas di {doc.department.name}. Jadwal dapat berubah; pilih tanggal kunjungan pada formulir untuk konfirmasi ketersediaan.
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleProfile(doc.id)}
                        className="underline mt-3 text-xs font-semibold text-[#0B2D45]"
                      >
                        Tutup Profil
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
