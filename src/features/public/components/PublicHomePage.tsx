"use client";

import { useState } from "react";
import { PublicHeader } from "./PublicHeader";
import { HeroSection } from "./HeroSection";
import { QuickMeshSection } from "./QuickMeshSection";
import { EmergencySection } from "./EmergencySection";
import { ServicesSection } from "./ServicesSection";
import { DoctorDirectorySection } from "./DoctorDirectorySection";
import { PaymentSection } from "./PaymentSection";
import { PatientGuideSection } from "./PatientGuideSection";
import { FacilitiesSection } from "./FacilitiesSection";
import { AppointmentFormSection } from "./AppointmentFormSection";
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
        <EmergencySection />
        <ServicesSection departments={departments} />
        <DoctorDirectorySection doctors={doctors} onSelectDoctor={handleSelectDoctor} />
        <PaymentSection />
        <PatientGuideSection />
        <FacilitiesSection />
        <AppointmentFormSection doctors={doctors} preselectedService={selectedDoctorForForm} />
        <LocationSection />
      </main>
      <PublicFooter />
    </div>
  );
}
