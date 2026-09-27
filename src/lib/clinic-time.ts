/** Calendar date in the clinic's local timezone (WIB). */
export function getClinicDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((value) => value.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Midnight in WIB represented as a UTC Date, for database range queries. */
export function getClinicDayRange(date = new Date()): { start: Date; end: Date } {
  const start = new Date(`${getClinicDateKey(date)}T00:00:00.000+07:00`);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}
