"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/lib/http/client";
import { useDialogAccessibility } from "@/lib/use-dialog-accessibility";

type Bill = {
  id: string; patientName: string; medicalRecordNo: string; total: number; createdAt: string;
  paidAt: string | null; completedAt: string | null; paymentMethod: string | null;
  receivedAmount: number | null; receivedBy: string | null;
  items: { id: string; description: string; quantity: number; unit: string; unitPrice: number; amount: number }[];
  appointment: { record: { prescription: { id: string; status: string } | null } | null };
};
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const date = (value: string) => new Date(value).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

function BillDetails({ bill, close, refresh }: { bill: Bill; close: () => void; refresh: () => void }) {
  const ref = useDialogAccessibility(close);
  const [method, setMethod] = useState("CASH");
  const [amount, setAmount] = useState(String(bill.total));
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const rx = bill.appointment.record?.prescription;
  const canPay = !rx || rx.status === "READY";

  async function pay(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      await fetchJson(`/api/bills/${bill.id}/pay`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, receivedAmount: Number(amount), confirmed }),
      });
      refresh(); close();
    } catch (err) { setError(err instanceof Error ? err.message : "Pembayaran gagal."); }
    finally { setBusy(false); }
  }

  return <div className="modal-backdrop">
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="bill-title" className="modal-card billing-dialog">
      <div className="modal-header"><h2 id="bill-title">{bill.paidAt ? "Struk Pembayaran" : "Rincian Tagihan"}</h2>
        <button className="btn-secondary" onClick={close} disabled={busy}>Tutup</button></div>
      <div className="modal-body">
        <section className="bill-receipt printable">
          <h3>KlinikCare</h3>
          <p>{bill.paidAt ? "BUKTI PEMBAYARAN • LUNAS" : "TAGIHAN • BELUM DIBAYAR"}</p>
          <p>No. tagihan: {bill.id}</p>
          <p>{bill.patientName} · {bill.medicalRecordNo}</p>
          <p>Kunjungan: {date(bill.createdAt)} WIB</p>
          <div className="billing-table-scroll"><table className="rx-table">
            <thead><tr><th>Layanan / obat</th><th>Jumlah</th><th>Harga satuan</th><th>Subtotal</th></tr></thead>
            <tbody>{bill.items.map(item => <tr key={item.id}><td>{item.description}</td><td>{item.quantity} {item.unit}</td><td>{money(item.unitPrice)}</td><td>{money(item.amount)}</td></tr>)}</tbody>
          </table></div>
          <p className="billing-total">Total <strong>{money(bill.total)}</strong></p>
          {bill.paidAt && <div>
            <p>Dibayar: {date(bill.paidAt)} WIB · {bill.paymentMethod === "CASH" ? "Tunai" : "QRIS"}</p>
            <p>Diterima: {money(bill.receivedAmount ?? bill.total)} · Kembali: {money((bill.receivedAmount ?? bill.total) - bill.total)}</p>
            <p>Petugas: {bill.receivedBy}</p>
            <p>{bill.completedAt ? "Kunjungan selesai." : "Pembayaran lunas. Obat belum diserahkan."}</p>
          </div>}
        </section>
        {error && <p role="alert" className="data-error">{error}</p>}
        {bill.paidAt ? <button className="btn-print" onClick={() => window.print()}>Cetak struk</button>
          : <form onSubmit={pay} className="billing-payment">
            {!canPay && <p role="status">Siapkan resep dan tandai siap diambil sebelum menerima pembayaran.</p>}
            <label>Metode pembayaran<select className="form-input" value={method} disabled={busy} onChange={e => { setMethod(e.target.value); setAmount(String(bill.total)); setConfirmed(false); }}>
              <option value="CASH">Tunai</option><option value="QRIS">QRIS (verifikasi manual)</option>
            </select></label>
            <label>Uang diterima (Rp)<input className="form-input" type="number" min={bill.total} max={2000000000} step="1" required value={amount} disabled={busy || method === "QRIS"} onChange={e => setAmount(e.target.value)} /></label>
            <p>Kembalian: {money(Math.max(0, Number(amount) - bill.total))}</p>
            <label className="billing-confirm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} required />
              {method === "QRIS" ? "Saya sudah memverifikasi dana masuk melalui QRIS klinik." : "Saya sudah menerima uang pasien."}</label>
            <button className="btn-primary-action" disabled={busy || !confirmed || !canPay || amount === "" || Number(amount) < bill.total}>{busy ? "Mencatat…" : "Konfirmasi pembayaran"}</button>
          </form>}
      </div>
    </div>
  </div>;
}

export function BillingPanel({ revision, onPaid }: { revision: number; onPaid: () => void }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selected, setSelected] = useState<Bill | null>(null);
  const [filter, setFilter] = useState("no");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchJson<{ bills: Bill[]; count: number }>(`/api/bills?paid=${filter}&q=${encodeURIComponent(search)}&page=${page}`);
      setBills(data.bills); setCount(data.count);
    } catch (err) { setError(err instanceof Error ? err.message : "Tagihan gagal dimuat."); }
    finally { setLoading(false); }
  }, [filter, search, page]);
  useEffect(() => { void load(); }, [load, revision]);
  return <section className="panel billing-panel" aria-labelledby="billing-heading">
    <div className="section-header-flex"><div><h2 id="billing-heading">Kasir Apotek</h2><p>Konsultasi dan obat dalam satu tagihan, termasuk kunjungan tanpa resep.</p></div>
      <button className="btn-refresh" onClick={load} disabled={loading}>Muat ulang tagihan</button></div>
    <form className="billing-filters" onSubmit={e => { e.preventDefault(); setPage(1); setSearch(query.trim()); }}>
      <input className="form-input" aria-label="Cari tagihan pasien" placeholder="Nama pasien atau nomor RM" value={query} onChange={e => setQuery(e.target.value)} />
      <select className="form-input" aria-label="Status pembayaran" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}><option value="no">Belum dibayar</option><option value="yes">Lunas</option><option value="">Semua tagihan</option></select>
      <button className="btn-secondary">Cari</button>
    </form>
    {error && <p role="alert" className="data-error">{error}</p>}
    {loading ? <p role="status">Memuat tagihan…</p> : !bills.length ? <p>Belum ada tagihan pada filter ini. Tagihan dibuat untuk pemeriksaan baru yang diselesaikan.</p> :
      <div className="billing-list">{bills.map(bill => <article className="billing-row" key={bill.id}>
        <div><strong>{bill.patientName}</strong><p>{bill.medicalRecordNo} · {date(bill.createdAt)} WIB</p>
          <small>{bill.completedAt ? "Kunjungan selesai" : bill.paidAt ? "Lunas · menunggu penyerahan obat" : "Belum dibayar"}{!bill.appointment.record?.prescription ? " · tanpa resep" : ""}</small></div>
        <strong>{money(bill.total)}</strong><button className="btn-primary-action" onClick={() => setSelected(bill)}>{bill.paidAt ? "Lihat struk" : "Rincian & bayar"}</button>
      </article>)}</div>}
    <div className="billing-pagination"><button className="btn-secondary" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>Sebelumnya</button><span>Halaman {page} · {count} tagihan</span><button className="btn-secondary" disabled={page * 20 >= count || loading} onClick={() => setPage(page + 1)}>Berikutnya</button></div>
    {selected && <BillDetails bill={selected} close={() => setSelected(null)} refresh={() => { void load(); onPaid(); }} />}
  </section>;
}
