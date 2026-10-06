"use client";
import { useCallback, useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { fetchJson } from "@/lib/http/client";
import { getClinicDateKey } from "@/lib/clinic-time";

const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const labels: Record<string, string> = { PENDING: "Menunggu admin", APPROVED: "Disetujui", REJECTED: "Ditolak", SETTLED: "Uang dikembalikan" };
type Entry = {
  id: string; billId: string; kind: string; status: string; amount: number; reason: string;
  requestedBy: string; createdAt: string; reviewedBy: string | null; reviewNote: string | null;
  settledBy: string | null; settlementReference: string | null;
  bill: { patientName: string; medicalRecordNo: string; total: number };
};
type Report = {
  gross: number; refunded: number; net: number; consultation: number; medicines: number; corrections: number;
  unpaid: { count: number; total: number }; pendingRefunds: { count: number; total: number };
  payments: { paymentMethod: string | null; _sum: { total: number | null }; _count: number }[];
  refunds: { settlementMethod: string | null; _sum: { amount: number | null }; _count: number }[];
};

function ReviewRow({ entry, admin, refresh }: { entry: Entry; admin: boolean; refresh: () => void }) {
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("CASH");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function act(approve?: boolean) {
    setBusy(true); setError("");
    try {
      await fetchJson("/api/bill-adjustments", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(admin ? { action: "review", id: entry.id, approve, note } : { action: "settle", id: entry.id, method, reference: note, confirmed }) });
      refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal menyimpan."); }
    finally { setBusy(false); }
  }
  return <article className="panel finance-review">
    <strong>{entry.kind === "REFUND" ? "Refund" : "Koreksi biaya"} · {money(entry.amount)} · {labels[entry.status]}</strong>
    <p>{entry.bill.patientName} · {entry.bill.medicalRecordNo}</p><small>Tagihan {entry.billId}</small>
    <p>Alasan: {entry.reason}</p><p>Pengaju: {entry.requestedBy} · {new Date(entry.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</p>
    {entry.reviewNote && <p>Keputusan {entry.reviewedBy}: {entry.reviewNote}</p>}
    {entry.settledBy && <p>Dikembalikan oleh {entry.settledBy}. Bukti: {entry.settlementReference}</p>}
    {((admin && entry.status === "PENDING") || (!admin && entry.kind === "REFUND" && entry.status === "APPROVED")) && <div className="billing-payment">
      <label>{admin ? "Catatan keputusan (wajib)" : "Nomor bukti transfer / tanda terima pasien"}<textarea className="form-input" value={note} minLength={5} maxLength={1000} onChange={e => setNote(e.target.value)} /></label>
      {!admin && <><label>Pengembalian melalui<select className="form-input" value={method} onChange={e => setMethod(e.target.value)}><option value="CASH">Tunai</option><option value="TRANSFER">Transfer</option></select></label>
        <label className="billing-confirm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> Saya telah mengembalikan {money(entry.amount)} kepada pasien.</label></>}
      <div className="header-actions-group">
        <button className="btn-primary-action" disabled={busy || note.trim().length < 5 || (!admin && !confirmed)} onClick={() => act(true)}>{busy ? "Menyimpan…" : admin ? "Setujui pengajuan" : "Catat uang dikembalikan"}</button>
        {admin && <button className="btn-secondary" disabled={busy || note.trim().length < 5} onClick={() => act(false)}>Tolak</button>}
      </div>
    </div>}
    {error && <p role="alert" className="data-error">{error}</p>}
  </article>;
}

export default function FinancePage({ admin }: { admin: boolean }) {
  const [from, setFrom] = useState(getClinicDateKey());
  const [to, setTo] = useState(getClinicDateKey());
  const [report, setReport] = useState<Report | null>(null);
  const [period, setPeriod] = useState("");
  const [error, setError] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(true);
  const loadEntries = useCallback(async () => {
    setBusy(true); setError("");
    try { const data = await fetchJson<{ entries: Entry[]; count: number }>(`/api/bill-adjustments?status=${status}&page=${page}`); setEntries(data.entries); setCount(data.count); }
    catch (err) { setError(err instanceof Error ? err.message : "Pengajuan gagal dimuat."); }
    finally { setBusy(false); }
  }, [page, status]);
  useEffect(() => { void loadEntries(); }, [loadEntries]);
  async function loadReport(event: React.FormEvent) {
    event.preventDefault(); setReportBusy(true); setError(""); setReport(null);
    try { setReport(await fetchJson<Report>(`/api/payment-reports?from=${from}&to=${to}`)); setPeriod(from + " sampai " + to); }
    catch (err) { setError(err instanceof Error ? err.message : "Laporan gagal dimuat."); }
    finally { setReportBusy(false); }
  }
  return <AppLayout activeNav={admin ? "/admin/finance" : "/pharmacy/finance"} breadcrumbTitle="Pembayaran & Koreksi">
    <div className="page"><h1 className="page-title">Pembayaran, Koreksi & Refund</h1>
      <p className="page-subtitle">Riwayat perubahan tercatat. Pengembalian dana tidak otomatis mengubah resep atau stok obat.</p>
      {error && <p role="alert" className="data-error">{error}</p>}
      <section className="panel billing-panel"><h2>Laporan pembayaran</h2>
        <form onSubmit={loadReport} className="billing-filters">
          <label>Dari<input className="form-input" type="date" required max={to} value={from} onChange={e => setFrom(e.target.value)} /></label>
          <label>Sampai<input className="form-input" type="date" required min={from} max={getClinicDateKey()} value={to} onChange={e => setTo(e.target.value)} /></label>
          <button className="btn-primary-action" disabled={reportBusy}>{reportBusy ? "Memuat…" : "Tampilkan laporan"}</button>
        </form>
        {report && <><div className="printable bill-receipt"><h3>KlinikCare · Laporan Pembayaran</h3><p>{period} · WIB</p>
          <div className="billing-row"><span>Penerimaan pembayaran</span><strong>{money(report.gross)}</strong></div>
          <div className="billing-row"><span>Refund yang telah dikembalikan</span><strong>{money(report.refunded)}</strong></div>
          <div className="billing-row"><span>Arus kas bersih periode ini</span><strong>{money(report.net)}</strong></div>
          <p>Rincian penerimaan: konsultasi {money(report.consultation)}, obat {money(report.medicines)}, koreksi biaya {money(report.corrections)}.</p>
          {report.payments.map(item => <p key={item.paymentMethod}>Masuk {item.paymentMethod === "CASH" ? "tunai" : "QRIS"}: {money(item._sum.total ?? 0)} · {item._count} pembayaran</p>)}
          {report.refunds.map(item => <p key={item.settlementMethod}>Keluar {item.settlementMethod === "CASH" ? "tunai" : "transfer"}: {money(item._sum.amount ?? 0)} · {item._count} refund</p>)}
          <p>Tagihan dibuat dalam periode ini yang masih belum lunas: {report.unpaid.count} · {money(report.unpaid.total)}</p>
          <p>Refund disetujui yang belum diserahkan (semua tanggal): {report.pendingRefunds.count} · {money(report.pendingRefunds.total)}</p>
          <small>Penerimaan mengikuti tanggal bayar; refund mengikuti tanggal uang dikembalikan. Nilai bersih dapat negatif bila refund atas pembayaran periode sebelumnya.</small>
        </div><button className="btn-print print-controls" onClick={() => window.print()}>Cetak laporan</button></>}
      </section>
      <section className="billing-panel"><h2>Pengajuan koreksi dan refund</h2>
        <div className="billing-filters"><label>Status<select className="form-input" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">Semua</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <button className="btn-refresh" onClick={loadEntries} disabled={busy}>Muat ulang pengajuan</button></div>
        {busy ? <p role="status">Memuat pengajuan…</p> : entries.length ? entries.map(entry => <ReviewRow key={entry.id} entry={entry} admin={admin} refresh={() => { void loadEntries(); setReport(null); }} />) : <p>Tidak ada pengajuan pada filter ini.</p>}
        <div className="billing-pagination"><button className="btn-secondary" disabled={page <= 1 || busy} onClick={() => setPage(page - 1)}>Sebelumnya</button><span>Halaman {page} · {count} pengajuan</span><button className="btn-secondary" disabled={page * 20 >= count || busy} onClick={() => setPage(page + 1)}>Berikutnya</button></div>
      </section>
    </div>
  </AppLayout>;
}
