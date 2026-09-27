export function reportRange(from: string | null, to: string | null) {
  if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) throw new Error("Pilih tanggal awal dan akhir.");
  const start = new Date(from + "T00:00:00+07:00");
  const last = new Date(to + "T00:00:00+07:00");
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(last.getTime()) ||
    new Date(start.getTime() + 7 * 3600000).toISOString().slice(0, 10) !== from ||
    new Date(last.getTime() + 7 * 3600000).toISOString().slice(0, 10) !== to ||
    last < start || last.getTime() - start.getTime() > 30 * 86400000) throw new Error("Rentang laporan harus valid, maksimal 31 hari.");
  return { start, end: new Date(last.getTime() + 86400000) };
}
