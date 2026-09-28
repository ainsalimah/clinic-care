import Link from "next/link";
import { ArrowUpRight, ClipboardPlus, Pill, Stethoscope, UserRoundCheck } from "lucide-react";

const roles = [
  { icon: UserRoundCheck, number: "01", role: "Resepsionis", title: "Kelola kedatangan", description: "Cari pasien, buat kunjungan, check-in, cetak nomor, dan panggil antrean langsung dari satu layar.", features: ["Direktori pasien", "Antrean & speaker", "Walk-in lansia"] },
  { icon: Stethoscope, number: "02", role: "Dokter", title: "Periksa dengan konteks", description: "Lihat riwayat pasien, panggil ke ruang, isi SOAP, tentukan diagnosis, dan kirim resep digital.", features: ["Rekam medis", "Resep digital", "Panggilan pasien"] },
  { icon: Pill, number: "03", role: "Apoteker", title: "Siapkan sampai lunas", description: "Proses resep, kelola stok, cetak etiket, lalu gabungkan jasa dokter dan obat dalam satu tagihan.", features: ["Stok real-time", "Etiket obat", "Tunai & QRIS"] },
  { icon: ClipboardPlus, number: "04", role: "Pasien", title: "Pantau kunjungan", description: "Buat janji, pilih dokter dan jadwal, lalu lihat status kunjungan serta riwayat pelayanan sendiri.", features: ["Daftar online", "Status kunjungan", "Riwayat pasien"] },
];

export function DemoExperienceSection() {
  return <section className="kc-demo kc-section" id="demo"><div className="kc-shell">
    <div className="kc-demo-intro kc-reveal">
      <div><p className="kc-eyebrow">Produk demo interaktif</p><h2 className="kc-heading">Empat sudut pandang.<br/><em>Satu alur yang utuh.</em></h2></div>
      <div><p>Semua akun menggunakan data simulasi yang sama, jadi perubahan pada satu role langsung terlihat di role berikutnya.</p><Link href="/login#demo">Pilih role dan mulai mencoba <ArrowUpRight size={16}/></Link></div>
    </div>
    <div className="kc-demo-grid kc-card-group">{roles.map(item=>{const Icon=item.icon;return <article className="kc-demo-card kc-card-motion" key={item.role}>
      <div className="kc-demo-card-top"><span>{item.number}</span><i><Icon size={22}/></i></div>
      <small>{item.role}</small><h3>{item.title}</h3><p>{item.description}</p>
      <ul>{item.features.map(feature=><li key={feature}>{feature}</li>)}</ul>
    </article>;})}</div>
    <div className="kc-demo-note kc-reveal"><span>DEMO DATA</span><p>Nama pasien, alamat, nomor rekam medis, transaksi, dan informasi klinis pada situs ini dibuat khusus untuk simulasi.</p><Link href="/login#demo">Masuk tanpa password <ArrowUpRight size={15}/></Link></div>
  </div></section>;
}
