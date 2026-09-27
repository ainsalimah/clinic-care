export const MAX_RUPIAH = 2_000_000_000;

export function rupiahAmount(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > MAX_RUPIAH) {
    throw new Error("Nominal harus berupa rupiah bulat antara 0 dan 2 miliar.");
  }
  return value;
}

export function billLines(doctorName: string, consultationFee: number, medicines: {
  name: string; unit: string; price: number; quantity: number;
}[]) {
  const items = [{ kind: "CONSULTATION", description: `Konsultasi ${doctorName}`, quantity: 1, unit: "layanan",
    unitPrice: rupiahAmount(consultationFee), amount: rupiahAmount(consultationFee) }];
  for (const medicine of medicines) {
    if (!Number.isSafeInteger(medicine.quantity) || medicine.quantity < 1) throw new Error("Jumlah obat tidak valid.");
    const unitPrice = rupiahAmount(medicine.price);
    items.push({ kind: "MEDICINE", description: medicine.name, quantity: medicine.quantity, unit: medicine.unit,
      unitPrice, amount: rupiahAmount(unitPrice * medicine.quantity) });
  }
  const total = rupiahAmount(items.reduce((sum, item) => sum + item.amount, 0));
  return { items, total };
}

export function paymentInput(method: unknown, received: unknown, total: number) {
  if (method !== "CASH" && method !== "QRIS") throw new Error("Pilih pembayaran tunai atau QRIS.");
  const amount = rupiahAmount(received);
  if (amount < total) throw new Error("Uang diterima kurang dari total tagihan.");
  if (method === "QRIS" && amount !== total) throw new Error("Nominal QRIS harus sama dengan total tagihan.");
  return { method, amount };
}
