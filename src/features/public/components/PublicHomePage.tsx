"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Activity, ArrowRight, Baby, CalendarDays, HeartPulse, Search, SmilePlus, Stethoscope } from "lucide-react";
import { getDoctorImage, weekdayNames } from "../content";
import { PublicHeader } from "./PublicHeader";
import { HeroSection } from "./HeroSection";
import { AboutSection } from "./AboutSection";
import { PatientGuideSection } from "./PatientGuideSection";
import { FaqSection } from "./FaqSection";
import { AppointmentBanner } from "./AppointmentBanner";
import { PublicFooter } from "./PublicFooter";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Schedule { id: string; dayOfWeek: number; startTime: string; endTime: string; quota: number; }
interface Doctor { id: string; fullName: string; specialization: string | null; schedules: Schedule[]; }
interface Department { id: string; name: string; description: string | null; doctors: Doctor[]; }

const departmentIcons = [Stethoscope, Baby, SmilePlus, Activity, HeartPulse];

export default function PublicHomePage() {
  const root = useRef<HTMLDivElement>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDoctor, setSearchDoctor] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/public/catalog").then(response => response.json()).then(data => setDepartments(data.departments ?? [])).catch(() => setDepartments([])).finally(() => setLoading(false));
  }, []);

  const allDoctors = useMemo(() => departments.flatMap(department => department.doctors.map(doctor => ({ ...doctor, departmentName: department.name, departmentId: department.id }))), [departments]);
  const filteredDoctors = useMemo(() => {
    const keyword = searchDoctor.trim().toLocaleLowerCase("id-ID");
    return allDoctors.filter(doctor => (selectedDeptFilter === "ALL" || doctor.departmentId === selectedDeptFilter) && (!keyword || [doctor.fullName, doctor.specialization, doctor.departmentName].filter(Boolean).some(value => value?.toLocaleLowerCase("id-ID").includes(keyword))));
  }, [allDoctors, searchDoctor, selectedDeptFilter]);

  useGSAP(() => {
    if (loading) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(".kc-hero-motion, .kc-reveal, .kc-card-motion", { clearProps: "all" });
      return;
    }
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".kc-hero-copy .kc-hero-motion", { y: 28, opacity: 0, duration: .75, stagger: .09 })
      .from(".kc-hero-visual", { y: 24, opacity: 0, scale: .97, duration: .9 }, "-=.65")
      .from(".kc-proof", { y: 18, opacity: 0, duration: .65 }, "-=.45");
    gsap.to(".kc-hero-image", { yPercent: 6, ease: "none", scrollTrigger: { trigger: ".kc-hero", start: "top top", end: "bottom top", scrub: .6 } });
    gsap.to(".kc-progress-bar", { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true } });
    gsap.utils.toArray<HTMLElement>(".kc-reveal").forEach(element => gsap.from(element, { y: 36, opacity: 0, duration: .85, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 86%", once: true } }));
    gsap.utils.toArray<HTMLElement>(".kc-card-group").forEach(group => gsap.from(group.querySelectorAll(".kc-card-motion"), { y: 28, opacity: 0, duration: .7, stagger: .08, ease: "power2.out", scrollTrigger: { trigger: group, start: "top 84%", once: true } }));
  }, { scope: root, dependencies: [loading], revertOnUpdate: true });

  return <div ref={root} className="kc-site">
    <div className="kc-progress" aria-hidden="true"><span className="kc-progress-bar" /></div>
    <PublicHeader />
    <main>
      <HeroSection />

      <section className="kc-services kc-section" id="poli"><div className="kc-shell">
        <div className="kc-section-head kc-reveal"><div><p className="kc-eyebrow">Poli & layanan</p><h2 className="kc-heading">Perawatan tepat, sesuai kebutuhan Anda.</h2></div><p>Tim dokter umum dan spesialis dengan dukungan rekam medis serta farmasi yang saling terhubung.</p></div>
        {loading ? <div className="kc-loading">Menyiapkan informasi layanan…</div> : departments.length ? <div className="kc-service-grid kc-card-group">
          {departments.map((department,index) => { const Icon=departmentIcons[index % departmentIcons.length]; return <article key={department.id} className="kc-service-card kc-card-motion">
            <div className="kc-service-top"><span className="kc-service-icon"><Icon size={22}/></span><span>0{index+1}</span></div>
            <h3>{department.name}</h3><p>{department.description || "Konsultasi dan pemeriksaan rawat jalan bersama dokter berpengalaman."}</p>
            <div><span>{department.doctors.length} dokter tersedia</span><Link href={`/register?dept=${department.id}`} aria-label={`Daftar ke ${department.name}`}><ArrowRight size={17}/></Link></div>
          </article>; })}
        </div> : <p className="kc-empty">Informasi poliklinik sedang diperbarui.</p>}
      </div></section>

      <AboutSection />

      <section className="kc-doctors kc-section" id="dokter"><div className="kc-shell">
        <div className="kc-section-head kc-reveal"><div><p className="kc-eyebrow">Dokter kami</p><h2 className="kc-heading">Kenali dokter sebelum Anda berkunjung.</h2></div><p>Cari berdasarkan nama, keahlian, atau poli, lalu pilih jadwal yang paling nyaman.</p></div>
        <div className="kc-doctor-filter kc-reveal">
          <label><Search size={18}/><input value={searchDoctor} onChange={event=>setSearchDoctor(event.target.value)} placeholder="Cari nama atau spesialisasi" aria-label="Cari dokter" /></label>
          <select value={selectedDeptFilter} onChange={event=>setSelectedDeptFilter(event.target.value)} aria-label="Filter poli"><option value="ALL">Semua poli</option>{departments.map(department=><option key={department.id} value={department.id}>{department.name}</option>)}</select>
        </div>
        {loading ? <div className="kc-loading">Memuat profil dokter…</div> : filteredDoctors.length ? <div className="kc-doctor-grid kc-card-group">
          {filteredDoctors.map(doctor => <article key={doctor.id} className="kc-doctor-card kc-card-motion">
            <div className="kc-doctor-photo"><Image src={getDoctorImage(doctor.fullName,doctor.departmentName)} alt={`Foto ${doctor.fullName}`} fill sizes="(max-width: 680px) 92vw, (max-width: 1024px) 45vw, 24vw" className="kc-cover"/><span>{doctor.departmentName}</span></div>
            <div className="kc-doctor-body"><h3>{doctor.fullName}</h3><p>{doctor.specialization || "Dokter Rawat Jalan"}</p><div className="kc-schedule-title"><CalendarDays size={15}/> Jadwal praktik</div>
              {doctor.schedules.length ? <ul>{doctor.schedules.slice(0,3).map(schedule=><li key={schedule.id}><b>{weekdayNames[schedule.dayOfWeek]}</b><span>{schedule.startTime}—{schedule.endTime}</span></li>)}</ul> : <small>Jadwal sedang diperbarui.</small>}
              <Link href={`/register?dept=${doctor.departmentId}`}>Pilih jadwal <ArrowRight size={14}/></Link>
            </div>
          </article>)}
        </div> : <div className="kc-empty"><b>Dokter tidak ditemukan.</b><button type="button" onClick={()=>{setSearchDoctor("");setSelectedDeptFilter("ALL");}}>Reset pencarian</button></div>}
      </div></section>

      <PatientGuideSection />
      <FaqSection />
      <AppointmentBanner />
    </main>
    <PublicFooter />
  </div>;
}
