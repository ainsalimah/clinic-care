"use client";

import { useState } from "react";
import { PublicHeader } from "./PublicHeader";
import { HeroSection } from "./HeroSection";
import { QuickMeshSection } from "./QuickMeshSection";
import { ServicesSection } from "./ServicesSection";
import { FacilitiesSection } from "./FacilitiesSection";
import { AboutSection } from "./AboutSection";
import { DoctorDirectorySection } from "./DoctorDirectorySection";
import { StepsSection } from "./StepsSection";
import { TrustSection } from "./TrustSection";
import { DemoExperienceSection } from "./DemoExperienceSection";
import { AppointmentFormSection } from "./AppointmentFormSection";
import { QuickCtaBanner } from "./QuickCtaBanner";
import { LocationSection } from "./LocationSection";
import { PublicFooter } from "./PublicFooter";
import type { PublicDoctor } from "./DoctorDirectorySection";

interface PublicHomePageProps {
  departments: { id: string; name: string; description: string | null }[];
  doctors: PublicDoctor[];
}

export default function PublicHomePage({ departments, doctors }: PublicHomePageProps) {
  const [selectedDoctorForForm, setSelectedDoctorForForm] = useState<string>("");

  const handleSelectDoctor = (docId: string) => {
    setSelectedDoctorForForm(docId);
    const formSection = document.getElementById("janji");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="site-shell">
      <PublicHeader />
      <main id="main-content">
        <HeroSection />
        <QuickMeshSection />
        <ServicesSection departments={departments} />
        <FacilitiesSection />
        <AboutSection />
        <DoctorDirectorySection doctors={doctors} onSelectDoctor={handleSelectDoctor} />
        <StepsSection />
        <TrustSection />
        <DemoExperienceSection />
        <AppointmentFormSection doctors={doctors} preselectedService={selectedDoctorForForm} />
        <QuickCtaBanner />
        <LocationSection />
      </main>
      <PublicFooter />
    </div>
  );
}
