"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDoctorImage, weekdayNames } from "../content";
import { PublicHeader } from "./PublicHeader";
import { HeroSection } from "./HeroSection";
import { AboutSection } from "./AboutSection";
import { PatientGuideSection } from "./PatientGuideSection";
import { FaqSection } from "./FaqSection";
import { AppointmentBanner } from "./AppointmentBanner";
import { PublicFooter } from "./PublicFooter";
import { ArrowRight, CalendarDays, Search } from "lucide-react";

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  quota: number;
}

interface Doctor {
  id: string;
  fullName: string;
  specialization: string | null;
  schedules: Schedule[];
}

interface Department {
  id: string;
  name: string;
  description: string | null;
  doctors: Doctor[];
}

export default function PublicHomePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDoctor, setSearchDoctor] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/public/catalog")
      .then((response) => response.json())
      .then((data) => setDepartments(data.departments ?? []))
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, []);

  const allDoctors = useMemo(
    () =>
      departments.flatMap((department) =>
        department.doctors.map((doctor) => ({
          ...doctor,
          departmentName: department.name,
          departmentId: department.id,
        }))
      ),
    [departments]
  );

  const filteredDoctors = useMemo(() => {
    const keyword = searchDoctor.trim().toLocaleLowerCase("id-ID");
    return allDoctors.filter((doctor) => {
      const matchesDepartment =
        selectedDeptFilter === "ALL" || doctor.departmentId === selectedDeptFilter;
      const matchesKeyword =
        !keyword ||
        [doctor.fullName, doctor.specialization, doctor.departmentName]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase("id-ID").includes(keyword));
      return matchesDepartment && matchesKeyword;
    });
  }, [allDoctors, searchDoctor, selectedDeptFilter]);

  return (
    <div className="min-h-screen bg-white text-[#153c34]">
      {/* 1. Navigasi Ringkas */}
      <PublicHeader />

      <main>
        {/* 2. Hero dengan foto yang menyatu ke tepi tata letak */}
        <HeroSection />

        {/* 3. Daftar Poli */}
        <section
          className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
          id="poli"
        >
          <div className="flex flex-col gap-4 border-b border-[#e5ede7] pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#187560]">
                Layanan & Spesialisasi
              </p>
              <h2 className="mt-3 font-jakarta text-2xl font-extrabold tracking-tight text-[#143c34] sm:text-3xl lg:text-4xl">
                Pilihan Poli Rawat Jalan
              </h2>
              <p className="mt-3 text-sm text-[#4e6c61] sm:text-base">
                Fasilitas konsultasi medis yang bersih, tertata, dan terintegrasi langsung dengan apotek klinik.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#187560] transition hover:text-[#0e483c] sm:text-sm"
            >
              Daftar Janji Konsultasi <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-[#668277]">
              Memuat data layanan poliklinik…
            </div>
          ) : departments.length ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {departments.map((department, idx) => (
                <div
                  key={department.id}
                  className="flex flex-col justify-between border-t border-[#d8e4dc] bg-[#f9fbf9] p-6 transition hover:bg-[#f2f7f4]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-jakarta text-xs font-extrabold tracking-wider text-[#187560]">
                        0{idx + 1}
                      </span>
                      <span className="text-xs font-medium text-[#5c7a6e]">
                        {department.doctors.length} Dokter Praktik
                      </span>
                    </div>

                    <h3 className="mt-4 font-jakarta text-lg font-bold tracking-tight text-[#143c34]">
                      {department.name}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#4e6b60] sm:text-sm">
                      {department.description ||
                        "Konsultasi dan pemeriksaan rawat jalan komprehensif bersama tim dokter berpengalaman."}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-[#e2eae4] pt-4">
                    <Link
                      href={`/register?dept=${department.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#187560] transition hover:text-[#0e483c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
                    >
                      Daftar Poli Ini <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-10 border border-dashed border-[#ccd9d0] p-10 text-center text-sm text-[#627e73]">
              Informasi poliklinik sedang diperbarui.
            </p>
          )}
        </section>

        {/* 4. Pengantar Klinik dan Pilihan Daftar Online atau Datang Langsung */}
        <AboutSection />

        {/* 5. Direktori Dokter dan Jadwal */}
        <section
          className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
          id="dokter"
        >
          <div className="flex flex-col gap-4 border-b border-[#e5ede7] pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#187560]">
                Direktori Dokter
              </p>
              <h2 className="mt-3 font-jakarta text-2xl font-extrabold tracking-tight text-[#143c34] sm:text-3xl lg:text-4xl">
                Jadwal Praktik Dokter
              </h2>
              <p className="mt-3 text-sm text-[#4e6c61] sm:text-base">
                Temukan dokter berdasarkan nama, spesialisasi, atau poli layanan untuk merencanakan waktu temu.
              </p>
            </div>
          </div>

          {/* Minimal Search and Filter Bar */}
          <div className="mt-8 grid gap-3 sm:grid-cols-12">
            <div className="relative sm:col-span-8 lg:col-span-9">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d8a7e]"
              />
              <input
                type="text"
                value={searchDoctor}
                onChange={(e) => setSearchDoctor(e.target.value)}
                placeholder="Cari nama dokter atau keahlian (contoh: dr. Hendra, Umum, Gigi...)"
                aria-label="Cari nama dokter atau spesialisasi"
                className="h-11 w-full rounded-lg border border-[#a9c0b7] bg-white pl-10 pr-4 text-sm text-[#143c34] placeholder:text-[#8ba298] focus:border-[#187560] focus:outline-none focus:ring-2 focus:ring-[#d8ede3]"
              />
            </div>

            <div className="sm:col-span-4 lg:col-span-3">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                aria-label="Filter berdasarkan poli"
                className="h-11 w-full rounded-lg border border-[#a9c0b7] bg-white px-3 text-sm font-medium text-[#143c34] focus:border-[#187560] focus:outline-none focus:ring-2 focus:ring-[#d8ede3]"
              >
                <option value="ALL">Semua Poli Layanan</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctor List (Minimal Clinical Grid) */}
          {loading ? (
            <div className="py-16 text-center text-sm text-[#668277]">
              Memuat profil dan jadwal dokter…
            </div>
          ) : filteredDoctors.length ? (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {filteredDoctors.map((doctor) => {
                const photoUrl = getDoctorImage(doctor.fullName, doctor.departmentName);

                return (
                  <article
                    key={doctor.id}
                    className="flex flex-col justify-between border-t border-[#d8e4dc] bg-white pt-4"
                  >
                    <div>
                      {/* Photo - Clean natural presentation, no overlay badges, no dark gradient */}
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#eef4f0]">
                        <Image
                          src={photoUrl}
                          alt={`Foto ${doctor.fullName}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="h-full w-full object-cover object-top"
                        />
                      </div>

                      {/* Doctor info placed neatly below the photo */}
                      <div className="mt-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#187560]">
                          {doctor.departmentName}
                        </span>
                        <h3 className="mt-1 font-jakarta text-base font-bold text-[#143c34]">
                          {doctor.fullName}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#527065]">
                          {doctor.specialization || "Dokter Rawat Jalan"}
                        </p>
                      </div>

                      {/* Schedule section */}
                      <div className="mt-4 border-t border-[#e8efe9] pt-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#48685e]">
                          <CalendarDays size={13} className="text-[#187560]" />
                          <span>Jadwal Praktik</span>
                        </div>

                        {doctor.schedules.length ? (
                          <ul className="mt-2 space-y-1">
                            {doctor.schedules.map((schedule) => (
                              <li
                                key={schedule.id}
                                className="flex items-center justify-between text-xs text-[#49665c]"
                              >
                                <span className="font-medium text-[#1f4b3e]">
                                  {weekdayNames[schedule.dayOfWeek]}
                                </span>
                                <span className="text-[#59786c]">
                                  {schedule.startTime}–{schedule.endTime} WIB
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-xs text-[#738e83]">Jadwal belum tersedia.</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[#edf2ee] pt-3">
                      <Link
                        href={`/register?dept=${doctor.departmentId}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#187560] transition hover:text-[#0e483c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
                      >
                        Pilih Jadwal Temu <ArrowRight size={13} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 border border-dashed border-[#ccd9d0] bg-[#fafcfa] p-12 text-center">
              <p className="text-sm font-semibold text-[#1f4b3e]">
                Dokter tidak ditemukan untuk kata kunci atau poli yang dipilih.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchDoctor("");
                  setSelectedDeptFilter("ALL");
                }}
                className="mt-3 text-xs font-bold text-[#187560] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#187560]"
              >
                Reset pencarian dan filter
              </button>
            </div>
          )}
        </section>

        {/* 6. Alur Kunjungan */}
        <PatientGuideSection />

        {/* 7. FAQ */}
        <FaqSection />

        {/* 8. Ajakan Mendaftar */}
        <AppointmentBanner />
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
