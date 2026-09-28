export interface PrescriptionItem {
  id: string;
  dosage: string;
  quantity: number;
  instruction: string;
  medicine: { id: string; name: string; form: string | null; unit: string; stock: number; reservedStock: number };
}

export interface PrescriptionData {
  stockHoldReason: string | null;
  stockHeldAt: string | null;
  stockResumedAt: string | null;
  id: string;
  status: "PENDING" | "PROCESSING" | "READY" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  dispensedAt: string | null;
  createdAt: string;
  patient: {
    id: string;
    fullName: string;
    medicalRecordNo: string;
    dateOfBirth: string;
    gender: string;
    allergies: string | null;
    phone: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  };
  doctor: { fullName: string; department: { name: string } };
  medicalRecord: { diagnosis: string | null; complaint: string | null; appointment: { bill: { total: number; paidAt: string | null } | null } };
  items: PrescriptionItem[];
}
