export interface QueueItem {
  id: string;
  queueNumber: string;
  status: "WAITING" | "CALLED" | "IN_ROOM" | "COMPLETED" | "SKIPPED";
  calledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  department: { id: string; name: string };
  appointment: {
    id: string;
    notes: string | null;
    patient: {
      id: string;
      fullName: string;
      medicalRecordNo: string;
      phone: string | null;
      dateOfBirth: string;
      emergencyContactName: string | null;
    };
    doctor: { id: string; fullName: string };
  };
}
