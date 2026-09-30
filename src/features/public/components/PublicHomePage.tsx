"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Baby,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  MapPin,
  Search,
  SmilePlus,
  Sparkles,
  Stethoscope,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { getDoctorImage, weekdayNames } from "../content";
import { PublicHeader } from "./PublicHeader";
import { HeroSection } from "./HeroSection";
import { HospitalFacilitiesSection } from "./HospitalFacilitiesSection";
import { AboutSection } from "./AboutSection";
import { DemoExperienceSection } from "./DemoExperienceSection";
import { PatientGuideSection } from "./PatientGuideSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { EmergencySection } from "./EmergencySection";
import { LocationSection } from "./LocationSection";
import { FaqSection } from "./FaqSection";
import { AppointmentBanner } from "./AppointmentBanner";
import { PublicFooter } from "./PublicFooter";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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
  consultationFee: number;
  licenseNumber: string | null;
  roomLabel: string | null;
  schedules: Schedule[];
}

interface Department {
  id: string;
  name: string;
  description: string | null;
  doctors: Doctor[];
}

const departmentIcons = [Stethoscope, Baby, SmilePlus, Activity, HeartPulse];

const deptHighlights: Record<string, string[]> = {
  "Poli Umum": ["Pemeriksaan Fisik Terstruktur", "Infeksi Saluran Napas", "Demam Akut & Flu", "Konsultasi Rutin"],
  "Poli Anak": ["Pediatri & Bayi/Balita", "Imunisasi Terjadwal", "Pemantauan Tumbuh Kembang", "Alergi & Nutrisi"],
  "Poli Gigi": ["Scaling Karang Gigi", "Penambalan Gigi Estetik", "Perawatan Saluran Akar", "Ekstraksi & Cabut"],
  "Poli Penyakit Dalam": ["Hipertensi & Kardiovaskular", "Manajemen Diabetes Melitus", "Gangguan Lambung/GERD", "Konsultasi Geriatri"],
};

const money = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function scheduleSummary(schedules: Schedule[]) {
  const groups = new Map<string, { days: number[]; startTime: string; endTime: string; quota: number }>();
  schedules.forEach((schedule) => {
    const key = schedule.startTime + "-" + schedule.endTime + "-" + schedule.quota;
    const group = groups.get(key) ?? {
      days: [],
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      quota: schedule.quota,
    };
    group.days.push(schedule.dayOfWeek);
    groups.set(key, group);
  });
  return [...groups.values()].map((group) => ({
    ...group,
    label:
      group.days.length >= 3 &&
      group.days.every((day, index) => index === 0 || day === group.days[index - 1] + 1)
        ? weekdayNames[group.days[0]] + "–" + weekdayNames[group.days[group.days.length - 1]]
        : group.days.map((day) => weekdayNames[day]).join(", "),
  }));
}

export default function PublicHomePage() {
  const root = useRef<HTMLDivElement>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    let list = allDoctors;
    if (selectedDeptId !== "ALL") {
      list = list.filter((doc) => doc.departmentId === selectedDeptId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (doc) =>
          doc.fullName.toLowerCase().includes(q) ||
          (doc.specialization && doc.specialization.toLowerCase().includes(q)) ||
          doc.departmentName.toLowerCase().includes(q) ||
          (doc.roomLabel && doc.roomLabel.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allDoctors, selectedDeptId, searchQuery]);

  useGSAP(
    () => {
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(".kc-hero-motion, .kc-reveal", { clearProps: "all" });
        return;
      }
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".kc-hero-copy .kc-hero-motion", { y: 26, opacity: 0, duration: 0.75, stagger: 0.08 })
        .from(".kc-hero-visual", { y: 32, opacity: 0, scale: 0.96, duration: 0.85 }, "-=0.5")
        .from(".kc-hero-proof-bar", { y: 20, opacity: 0, duration: 0.65 }, "-=0.3");

      gsap.to(".kc-progress-bar", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      gsap.utils.toArray<HTMLElement>(".kc-reveal").forEach((element) => {
        gsap.from(element, {
          y: 28,
          opacity: 0,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true,
          },
        });
      });
    },
    { scope: root }
  );

  const handleSelectPoliAndScroll = (deptId: string) => {
    setSelectedDeptId(deptId);
    const el = document.getElementById("dokter");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div ref={root} className="kc-site">
      <div className="kc-progress" aria-hidden="true">
        <span className="kc-progress-bar" />
      </div>

      <PublicHeader />

      <main>
        {/* 1. Hero Section with Creative Image Composition & Quick Actions */}
        <HeroSection doctorCount={allDoctors.length} departmentCount={departments.length} />

        {/* 2. Interactive Polyclinic Services Section */}
        <section className="kc-services-section kc-section" id="poli">
          <div className="kc-shell">
            <div className="kc-section-head kc-reveal">
              <div>
                <p className="kc-eyebrow">
                  <Sparkles size={13} />
                  <span>Direktori Layanan Poliklinik</span>
                </p>
                <h2 className="kc-heading">
                  Empat poliklinik dengan alur klinis<br />
                  <em>yang saling terhubung seketika.</em>
                </h2>
              </div>
              <p className="kc-section-head-desc">
                Setiap poli memiliki kuota dokter terjadwal, rekam medis SOAP terstandar Kemenkes, serta
                instalasi farmasi yang terintegrasi di dalam satu platform.
              </p>
            </div>

            {loading ? (
              <div className="kc-loading-box">
                <span className="kc-spinner" />
                <span>Menyiapkan informasi layanan poliklinik…</span>
              </div>
            ) : departments.length ? (
              <div className="kc-service-grid">
                {departments.map((department, index) => {
                  const Icon = departmentIcons[index % departmentIcons.length];
                  const highlights = deptHighlights[department.name] || [
                    "Pemeriksaan Terstandar",
                    "Konsultasi Spesialis",
                    "Rekam Medis Digital",
                    "E-Resep Farmasi",
                  ];
                  return (
                    <article key={department.id} className="kc-service-card kc-reveal">
                      <div className="kc-service-top">
                        <div className="kc-service-icon-box">
                          <Icon size={24} />
                        </div>
                        <span className="kc-service-num">0{index + 1}</span>
                      </div>

                      <h3 className="kc-service-name">{department.name}</h3>
                      <p className="kc-service-desc">
                        {department.description ||
                          "Konsultasi, pemeriksaan fisik terstruktur, dan penanganan rawat jalan bersama dokter berpengalaman."}
                      </p>

                      {/* Clinical Scope Chips */}
                      <div className="kc-service-chips">
                        {highlights.map((h) => (
                          <span key={h} className="kc-service-chip">
                            <CheckCircle2 size={11} className="text-emerald-700" />
                            <span>{h}</span>
                          </span>
                        ))}
                      </div>

                      <div className="kc-service-foot">
                        <div className="kc-service-badge">
                          <Users size={14} />
                          <span>{department.doctors.length} dokter bertugas</span>
                        </div>
                        <div className="kc-service-actions">
                          <button
                            type="button"
                            className="kc-service-view-btn"
                            onClick={() => handleSelectPoliAndScroll(department.id)}
                          >
                            <span>Lihat Jadwal</span>
                            <ArrowRight size={13} />
                          </button>
                          <Link
                            href={"/register?dept=" + department.id}
                            className="kc-service-arrow-btn"
                            aria-label={"Daftar ke " + department.name}
                            title="Daftar janji temu online"
                          >
                            <CalendarCheck size={16} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="kc-empty-notice">Informasi poliklinik sedang diperbarui.</p>
            )}
          </div>
        </section>

        {/* 3. Doctor Directory Section with Department Filter & Live Search */}
        <section className="kc-doctors-section kc-section" id="dokter">
          <div className="kc-shell">
            <div className="kc-section-head kc-reveal">
              <div>
                <p className="kc-eyebrow">
                  <Sparkles size={13} />
                  <span>Direktori Dokter & Jadwal Praktik</span>
                </p>
                <h2 className="kc-heading">
                  Profil dokter, tarif konsultasi, ruang, & kuota<br />
                  <em>dalam satu tampilan transparan.</em>
                </h2>
              </div>
              <p className="kc-section-head-desc">
                Seluruh profil dokter berikut terhubung langsung dengan kuota pendaftaran harian dan
                sistem rekam medis SOAP terstandar.
              </p>
            </div>

            {/* Department Filter Tabs and Search Bar */}
            <div className="kc-doctor-controls kc-reveal">
              <div className="kc-doctor-filter-bar">
                <button
                  type="button"
                  className={"kc-filter-btn " + (selectedDeptId === "ALL" ? "kc-filter-btn-active" : "")}
                  onClick={() => setSelectedDeptId("ALL")}
                >
                  <span>Semua Poli ({allDoctors.length})</span>
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    className={"kc-filter-btn " + (selectedDeptId === dept.id ? "kc-filter-btn-active" : "")}
                    onClick={() => setSelectedDeptId(dept.id)}
                  >
                    <span>{dept.name} ({dept.doctors.length})</span>
                  </button>
                ))}
              </div>

              {/* Instant Search Bar */}
              <div className="kc-doctor-search">
                <Search size={16} className="kc-search-icon" />
                <input
                  type="text"
                  placeholder="Cari dokter atau spesialisasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="kc-search-input"
                  aria-label="Cari nama dokter atau spesialisasi"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="kc-search-clear"
                    aria-label="Hapus pencarian"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="kc-loading-box">
                <span className="kc-spinner" />
                <span>Memuat profil dokter…</span>
              </div>
            ) : filteredDoctors.length ? (
              <div className="kc-doctor-grid">
                {filteredDoctors.map((doctor) => (
                  <article key={doctor.id} className="kc-doctor-card kc-reveal">
                    <div className="kc-doctor-photo">
                      <Image
                        src={getDoctorImage(doctor.fullName, doctor.departmentName)}
                        alt={"Foto " + doctor.fullName}
                        fill
                        sizes="(max-width: 680px) 100vw, (max-width: 1024px) 45vw, 240px"
                        className="kc-cover"
                      />
                      <span className="kc-doctor-photo-tag">{doctor.departmentName}</span>
                    </div>

                    <div className="kc-doctor-body">
                      <div className="kc-doctor-name">
                        <div>
                          <h3>{doctor.fullName}</h3>
                          <p>{doctor.specialization || "Dokter Rawat Jalan"}</p>
                        </div>
                        <span className="kc-verified-badge" title="SIP Terverifikasi Kemenkes">
                          <BadgeCheck size={20} className="kc-verified-check" />
                        </span>
                      </div>

                      <div className="kc-doctor-meta">
                        <span className="kc-meta-item">
                          <MapPin size={13} />
                          <span>{doctor.roomLabel || "Ruang Praktik"}</span>
                        </span>
                        <span className="kc-meta-item">
                          <BadgeCheck size={13} />
                          <span>{doctor.licenseNumber || "SIP Terverifikasi"}</span>
                        </span>
                      </div>

                      <div className="kc-fee-row">
                        <span>
                          <WalletCards size={16} />
                          <span>Tarif Konsultasi:</span>
                        </span>
                        <b>{money.format(doctor.consultationFee)}</b>
                      </div>

                      <div className="kc-schedule-box">
                        <div className="kc-schedule-title">
                          <CalendarDays size={14} />
                          <span>Jadwal Praktik & Kuota Harian</span>
                        </div>
                        {doctor.schedules.length ? (
                          <ul className="kc-schedule-list">
                            {scheduleSummary(doctor.schedules).map((group) => (
                              <li key={group.label + "-" + group.startTime}>
                                <div>
                                  <b>{group.label}</b>
                                  <small className="kc-quota-pill">
                                    Kuota: {group.quota} pasien / sesi
                                  </small>
                                </div>
                                <span className="kc-schedule-time">
                                  <Clock3 size={12} />
                                  <span>{group.startTime}–{group.endTime} WIB</span>
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <small className="kc-no-schedule">Jadwal praktik sedang diperbarui.</small>
                        )}
                      </div>

                      <div className="kc-doctor-action-box">
                        <Link
                          href={"/register?dept=" + doctor.departmentId}
                          className="kc-btn-primary kc-btn-block"
                        >
                          <CalendarCheck size={16} />
                          <span>Pilih Dokter & Jadwal</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="kc-empty-notice">
                <p>Tidak ada dokter yang cocok dengan pencarian atau filter yang dipilih.</p>
                {(searchQuery || selectedDeptId !== "ALL") && (
                  <button
                    type="button"
                    className="kc-btn-secondary"
                    style={{ marginTop: "14px" }}
                    onClick={() => {
                      setSelectedDeptId("ALL");
                      setSearchQuery("");
                    }}
                  >
                    Reset Filter & Pencarian
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 4. Hospital Facilities & Infrastructure Showcase */}
        <HospitalFacilitiesSection />

        {/* 5. Clinical Standards & Operational Excellence */}
        <AboutSection />

        {/* 6. Interactive 4-Role Simulator Experience */}
        <DemoExperienceSection />

        {/* 7. Patient 5-Step Journey / How It Works */}
        <PatientGuideSection />

        {/* 8. Patient Experience & Testimonials */}
        <TestimonialsSection />

        {/* 9. Emergency / UGD 24 Jam Hotline */}
        <EmergencySection />

        {/* 10. Location, Access & Visiting Hours */}
        <LocationSection />

        {/* 11. Frequently Asked Questions */}
        <FaqSection />

        {/* 12. Final Call to Action */}
        <AppointmentBanner />
      </main>

      {/* 13. Comprehensive Medical Footer */}
      <PublicFooter />
    </div>
  );
}
