import { randomUUID } from "node:crypto";
import { getClinicDateKey } from "@/lib/clinic-time";

/** Generate an opaque record number without counting existing patients. */
export function createMedicalRecordNumber(): string {
  const year = getClinicDateKey().slice(0, 4);
  return `RM-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;
}
