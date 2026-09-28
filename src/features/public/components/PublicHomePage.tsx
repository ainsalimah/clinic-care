"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Activity, ArrowRight, BadgeCheck, Baby, CalendarDays, HeartPulse, MapPin, SmilePlus, Stethoscope, WalletCards } from "lucide-react";
import { getDoctorImage, weekdayNames } from "../content";
import { PublicHeader } from "./PublicHeader";
import { HeroSection } from "./HeroSection";
import { DemoExperienceSection } from "./DemoExperienceSection";
import { AboutSection } from "./AboutSection";
import { PatientGuideSection } from "./PatientGuideSection";
import { FaqSection } from "./FaqSection";
import { AppointmentBanner } from "./AppointmentBanner";
import { PublicFooter } from "./PublicFooter";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Schedule { id: string; dayOfWeek: number; startTime: string; endTime: string; quota: number; }
interface Doctor { id: string; fullName: string; specialization: string | null; consultationFee: number; licenseNumber: string | null; roomLabel: string | null; schedules: Schedule[]; }
interface Department { id: string; name: string; description: string | null; doctors: Doctor[]; }

const departmentIcons = [Stethoscope, Baby, SmilePlus, Activity, HeartPulse];
const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function scheduleSummary(schedules: Schedule[]) {
  const groups = new Map<string, { days: number[]; startTime: string; endTime: string; quota: number }>();
  schedules.forEach(schedule => {
    const key = `${schedule.startTime}-${schedule.endTime}-${schedule.quota}`;
    const group = groups.get(key) ?? { days: [], startTime: schedule.startTime, endTime: schedule.endTime, quota: schedule.quota };
    group.days.push(schedule.dayOfWeek);
    groups.set(key, group);
  });
  return [...groups.values()].map(group => ({
    ...group,
    label: group.days.length >= 3 && group.days.every((day, index) => index === 0 || day === group.days[index - 1] + 1)
      ? `${weekdayNames[group.days[0]]}–${weekdayNames[group.days[group.days.length - 1]]}`
      : group.days.map(day => weekdayNames[day]).join(", "),
  }));
}

export default function PublicHomePage() {
  const root = useRef<HTMLDivElement>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/catalog")
      .then(response => response.json())
      .then(data => setDepartments(data.departments ?? []))
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, []);

  const allDoctors = useMemo(() => departments.flatMap(department => department.doctors.map(doctor => ({
    ...doctor,
    departmentName: department.name,
    departmentId: department.id,
  }))), [departments]);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(".kc-hero-motion, .kc-reveal", { clearProps: "all" });
      return;
    }
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".kc-hero-copy .kc-hero-motion", { y: 28, duration: .75, stagger: .09 })
      .from(".kc-hero-console", { y: 34, scale: .96, duration: .9 }, "-=.62")
      .from(".kc-hero-background", { scale: 1.1, duration: 1.1 }, 0)
      .from(".kc-proof", { y: 18, duration: .65 }, "-=.45");
    gsap.to(".kc-hero-background", { yPercent: 6, ease: "none", scrollTrigger: { trigger: ".kc-hero", start: "top top", end: "bottom top", scrub: .6 } });
    gsap.to(".kc-progress-bar", { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true } });
    gsap.utils.toArray<HTMLElement>(".kc-reveal").forEach(element => gsap.from(element, { y: 36, duration: .85, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 86%", once: true } }));
  }, { scope: root });

  useGSAP(() => {
    if (loading) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(".kc-card-motion", { clearProps: "all" });
      return;
    }
    gsap.utils.toArray<HTMLElement>(".kc-card-group").forEach(group => gsap.from(group.querySelectorAll(".kc-card-motion"), { y: 28, duration: .7, stagger: .08, ease: "power2.out", scrollTrigger: { trigger: group, start: "top 84%", once: true } }));
  }, { scope: root, dependencies: [loading], revertOnUpdate: true });

  return <div ref={root} className="kc-site">
    <div className="kc-progress" aria-hidden="true"><span className="kc-progress-bar" /></div>
    <PublicHeader />
    <main>
      <HeroSection doctorCount={allDoctors.length} departmentCount={departments.length} />
      <DemoExperienceSection />

      <section className="kc-services kc-section" id="poli"><div className="kc-shell">
        <div className="kc-section-head kc-reveal"><div><p className="kc-eyebrow">Direktori layanan</p><h2 className="kc-heading">Empat poli dengan alur klinis yang benar-benar terhubung.</h2></div><p>Setiap poli memiliki dokter, jadwal praktik, kuota, rekam medis, resep, dan farmasi di dalam demo yang sama.</p></div>
        {loading ? <div className="kc-loading">Menyiapkan informasi layanan…</div> : departments.length ? <div className="kc-service-grid kc-card-group">
          {departments.map((department,index) => { const Icon=departmentIcons[index % departmentIcons.length]; return <article key={department.id} className="kc-service-card kc-card-motion">
            <div className="kc-service-top"><span className="kc-service-icon"><Icon size={22}/></span><span>0{index+1}</span></div>
            <h3>{department.name}</h3><p>{department.description || "Konsultasi dan pemeriksaan rawat jalan bersama dokter berpengalaman."}</p>
            <div><span>{department.doctors.length} dokter · jadwal aktif</span><Link href={`/register?dept=${department.id}`} aria-label={`Daftar ke ${department.name}`}><ArrowRight size={17}/></Link></div>
          </article>; })}
        </div> : <p className="kc-empty">Informasi poliklinik sedang diperbarui.</p>}
      </div></section>

      <AboutSection />

      <section className="kc-doctors kc-section" id="dokter"><div className="kc-shell">
        <div className="kc-section-head kc-reveal"><div><p className="kc-eyebrow">Direktori dokter lengkap</p><h2 className="kc-heading">Semua dokter, tarif, ruang, dan jadwal dalam satu tampilan.</h2></div><p>Seluruh profil berikut terhubung langsung dengan data pendaftaran dan dashboard dokter pada mode demo.</p></div>
        {loading ? <div className="kc-loading">Memuat seluruh profil dokter…</div> : allDoctors.length ? <div className="kc-doctor-grid kc-card-group">
          {allDoctors.map(doctor => <article key={doctor.id} className="kc-doctor-card kc-card-motion">
            <div className="kc-doctor-photo"><Image src={getDoctorImage(doctor.fullName,doctor.departmentName)} alt={`Foto ${doctor.fullName}`} fill sizes="(max-width: 680px) 92vw, (max-width: 1024px) 42vw, 210px" className="kc-cover"/><span>{doctor.departmentName}</span></div>
            <div className="kc-doctor-body">
              <div className="kc-doctor-name"><div><h3>{doctor.fullName}</h3><p>{doctor.specialization || "Dokter Rawat Jalan"}</p></div><BadgeCheck size={21}/></div>
              <div className="kc-doctor-meta"><span><MapPin size={14}/>{doctor.roomLabel || "Ruang praktik"}</span><span><BadgeCheck size={14}/>{doctor.licenseNumber || "SIP terverifikasi"}</span></div>
              <div className="kc-fee-row"><span><WalletCards size={16}/>Tarif konsultasi</span><b>{money.format(doctor.consultationFee)}</b></div>
              <div className="kc-schedule-title"><CalendarDays size={15}/> Jadwal praktik lengkap</div>
              {doctor.schedules.length ? <ul>{scheduleSummary(doctor.schedules).map(group=><li key={`${group.label}-${group.startTime}`}><div><b>{group.label}</b><small>Kuota {group.quota} pasien / hari</small></div><span>{group.startTime}–{group.endTime}</span></li>)}</ul> : <small>Jadwal sedang diperbarui.</small>}
              <Link href={`/register?dept=${doctor.departmentId}`}>Pilih dokter & jadwal <ArrowRight size={14}/></Link>
            </div>
          </article>)}
        </div> : <div className="kc-empty"><b>Profil dokter belum tersedia.</b></div>}
      </div></section>

      <PatientGuideSection />
      <FaqSection />
      <AppointmentBanner />
    </main>
    <PublicFooter />
  </div>;
}
