/** Shared contract for dashboard KPIs and the operational reports API. */
export interface ReportSummary {
  totalPatients: number;
  registeredPatientsCount: number;
  elderlyPatientsCount: number;
  totalDoctors: number;
  totalDepartments: number;
  totalMedicines: number;
  totalMedicalRecords: number;
  visitsCount: number;
  activeQueuesCount: number;
  completedQueuesCount: number;
  pendingPrescriptionsCount: number;
  completedPrescriptionsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}
