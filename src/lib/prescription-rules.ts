export type PrescriptionState = "PENDING" | "PROCESSING" | "READY" | "COMPLETED" | "CANCELLED";
const transitions: Record<PrescriptionState, PrescriptionState[]> = {
  PENDING: ["PROCESSING", "CANCELLED"], PROCESSING: ["READY", "CANCELLED"],
  READY: ["COMPLETED", "CANCELLED"], COMPLETED: [], CANCELLED: [],
};
export function canTransitionPrescription(from: PrescriptionState, to: PrescriptionState) {
  return from === to || transitions[from].includes(to);
}
export type PrescriptionInput = { medicineId: string; dosage: string; quantity: number; instruction: string };
export function parsePrescriptionItems(value: unknown): PrescriptionInput[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 50) throw new Error("Resep harus berupa daftar maksimal 50 obat.");
  const seen = new Set<string>();
  return value.map((item) => {
    if (!item || typeof item !== "object" || typeof item.medicineId !== "string" || !item.medicineId ||
      typeof item.dosage !== "string" || !item.dosage.trim() || item.dosage.length > 200 ||
      typeof item.instruction !== "string" || !item.instruction.trim() || item.instruction.length > 500 ||
      !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 10000 || seen.has(item.medicineId)) {
      throw new Error("Obat tidak boleh duplikat; dosis, instruksi, dan jumlah bulat 1–10000 wajib diisi.");
    }
    seen.add(item.medicineId);
    return { medicineId: item.medicineId, dosage: item.dosage.trim(), quantity: item.quantity, instruction: item.instruction.trim() };
  });
}
