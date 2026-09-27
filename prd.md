# PRD — KlinikCare: Manajemen Klinik Rawat Jalan dan Apotek

## 1. Ringkasan Produk

KlinikCare adalah website publik dan aplikasi staf untuk mengelola layanan klinik rawat jalan dari pengajuan kunjungan, verifikasi, antrean, pemeriksaan dokter, resep, hingga penyerahan obat di apotek.

Satu data pasien digunakan kembali untuk kunjungan berikutnya. Pasien dapat mendaftar online atau dibantu resepsionis. Pengajuan kunjungan online menunggu verifikasi dan tidak langsung membuat antrean; check-in pada hari kunjungan menerbitkan nomor antrean. Aplikasi ini berfokus pada rawat jalan dan farmasi, bukan seluruh fungsi rumah sakit.

## 2. Tujuan

- Mempercepat proses pendaftaran dan antrean pasien.
- Membantu dokter menyimpan rekam kunjungan serta membuat resep digital.
- Membantu apoteker memproses resep dan memantau persediaan obat.
- Memberikan admin laporan operasional klinik.
- Mendukung pelayanan inklusif untuk pasien lansia dan pasien tanpa smartphone.

## 3. Pengguna dan Hak Akses

| Role | Tujuan | Hak akses utama |
|---|---|---|
| Pasien | Mengajukan dan memantau jadwal sendiri | Buat akun, lihat poli/dokter/jadwal publik, ajukan kunjungan, lihat status kunjungannya |
| Resepsionis | Mengelola identitas dan kedatangan pasien | Cari/daftar pasien walk-in, verifikasi/batalkan pengajuan online, check-in, antrean |
| Dokter | Memberikan pelayanan klinis | Antrean praktik, riwayat klinis yang relevan, pemeriksaan, rekam medis, resep |
| Apoteker | Memproses dan menyerahkan obat | Resep masuk, katalog obat, stok, riwayat penyerahan |
| Admin | Memantau operasional | Dashboard/laporan, direktori pasien dan antrean baca-saja, katalog obat baca-saja |

## 4. Alur Utama

```text
Pasien memilih pendaftaran online atau datang langsung
        ↓
Online: pasien membuat akun / menghubungkan data lama dan mengajukan jadwal
        ↓
Resepsionis meninjau identitas, poli, dokter, jadwal, lalu mengonfirmasi atau menolak
        ↓
Pasien datang pada tanggal kunjungan → resepsionis check-in
        ↓
Nomor antrean terbit
        ↓
Walk-in: resepsionis mencari pasien atau mendaftarkan pasien baru
        ↓
Resepsionis memilih poli/dokter dan langsung check-in
        ↓
Dokter memeriksa dan membuat rekam medis
        ↓
Dokter membuat resep (opsional)
        ↓
Apoteker memproses dan menyerahkan obat
        ↓
Kunjungan dan resep ditandai selesai
```

## 5. Kebutuhan Fitur

### 5.1 Website Publik dan Pasien

- Beranda publik menampilkan informasi klinik, layanan/poli, dokter, jadwal praktik, FAQ, dan tautan masuk/daftar.
- Pasien baru dapat membuat akun dan profil pasien online menggunakan email, telepon, NIK, tanggal lahir, nama, serta jenis kelamin.
- Pasien lama dapat menghubungkan akun ke profil yang belum terhubung jika NIK, nama, dan tanggal lahir cocok; jika tidak, diarahkan menghubungi resepsionis.
- Pasien masuk ke portal untuk melihat jadwal dokter, mengajukan tanggal kunjungan, dan memantau status pengajuan.
- Pengajuan online memiliki status `PENDING`; sistem memeriksa jadwal dan kuota, tetapi tidak menerbitkan antrean.
- Pasien memilih dokter dan jadwal yang masih memiliki slot; jika penuh, pasien dapat memilih dokter lain pada poli yang sama.
- Pasien hanya dapat melihat kunjungan yang terkait dengan akunnya. Rekam medis dan resep tidak ditampilkan di portal MVP.
- OTP, verifikasi email sungguhan, lupa kata sandi otomatis, akun wali, dan pembatalan mandiri belum termasuk MVP.

### 5.2 Resepsionis

- Mencari pasien lama sebelum membuat pasien baru, untuk menghindari duplikasi.
- Mendaftarkan identitas dasar pasien satu kali dan menerbitkan No. RM.
- Membuat kunjungan walk-in terpisah dari data identitas pasien.
- Memilih poli dan dokter, check-in, lalu menerbitkan nomor antrean.
- Meninjau pengajuan online, mengonfirmasi atau membatalkannya, dan melakukan check-in pada hari jadwal.
- Mencetak kartu pasien atau tiket antrean bila diperlukan.
- Mengisi kontak pasien dan kontak pendamping secara opsional; keduanya bukan data yang sama.
- Menjalankan satu layar speaker ruang tunggu dan mengatur nama ruang untuk setiap dokter.

### 5.3 Dokter

- Melihat jadwal praktik dan antrean pasien.
- Memanggil serta mengubah status pasien menjadi sedang diperiksa.
- Melihat profil pasien dan riwayat kunjungan.
- Mencatat keluhan, hasil pemeriksaan, diagnosis, dan tindakan.
- Membuat resep berisi obat, dosis, jumlah, dan aturan pakai.
- Menyelesaikan konsultasi dan meneruskan resep ke apotek.
- Setelah pemeriksaan selesai, sistem menjadwalkan panggilan pasien berikutnya milik dokter yang sama dengan jeda 10 detik; dokter dapat membatalkan selama jeda.
- Panggilan manual dan panggilan ulang menyebut nomor antrean serta ruang, lalu diputar bergantian melalui satu speaker.

### 5.4 Apoteker

- Melihat resep baru dari dokter.
- Memeriksa detail resep dan ketersediaan obat.
- Mengubah status resep: `menunggu`, `diproses`, `siap diambil`, `selesai`.
- Menyerahkan obat dan mencatat waktu penyerahan.
- Mengurangi stok obat secara otomatis saat obat diserahkan.
- Menambah katalog obat dan mencatat penerimaan/perubahan stok.
- Melihat peringatan stok menipis.

### 5.5 Admin

- Melihat dashboard dan laporan operasional.
- Melihat direktori pasien, antrean, dan ketersediaan obat dalam mode baca-saja sesuai kebutuhan pemantauan.
- Tidak melakukan pendaftaran/check-in, pemeriksaan klinis, pemrosesan resep, atau perubahan katalog/stok obat.

## 6. Status Utama

### Appointment

`menunggu_konfirmasi → dikonfirmasi → check_in → diperiksa → selesai`

Alternatif akhir: `dibatalkan` atau `tidak_hadir`.

### Resep

`menunggu → diproses → siap_diambil → selesai`

Alternatif akhir: `dibatalkan`.

## 7. Struktur Data Inti

| Tabel | Data penting |
|---|---|
| users | email, password hash, role, status akun |
| patients | nomor rekam medis, NIK, biodata, alergi, kontak darurat |
| patient_guardians | patient_id, user_id, hubungan keluarga |
| doctors | user_id, spesialisasi, nomor izin, ruang praktik |
| departments | nama poli, deskripsi |
| schedules | dokter, poli, hari, jam, kuota |
| appointments | pasien, dokter, jadwal, status |
| queues | appointment, nomor antrean, status |
| queue_auto_calls | dokter, pemeriksaan selesai, waktu panggil, status batal/proses |
| queue_announcements | antrean, ruang, waktu pengumuman, status pemutaran |
| medical_records | pasien, dokter, keluhan, diagnosis, tindakan |
| prescriptions | rekam medis, pasien, dokter, status |
| prescription_items | resep, obat, dosis, jumlah, aturan pakai |
| medicines | nama obat, bentuk, satuan, harga, stok minimum |
| medicine_batches | obat, nomor batch, stok, kedaluwarsa |
| inventory_transactions | obat, tipe transaksi, jumlah, referensi resep |

## 8. Kebutuhan Nonfungsional

- Setiap role hanya dapat mengakses data yang relevan.
- Password disimpan dalam bentuk hash.
- Rekam medis tidak dapat diubah sembarangan setelah konsultasi selesai; perubahan perlu tercatat.
- Semua perubahan stok obat dicatat sebagai transaksi inventaris.
- Antarmuka harus mudah dibaca: teks cukup besar, kontras tinggi, dan alur sederhana.
- Data pasien dan rekam medis perlu dilindungi dengan autentikasi serta otorisasi berbasis role.

## 9. Ruang Lingkup MVP

MVP mencakup:

- Website publik dengan informasi klinik, poli, dokter, jadwal, dan FAQ.
- Login, pembuatan akun pasien, dan pembatasan akses berbasis role.
- Pendaftaran online pasien baru dan penghubungan pasien lama lewat kecocokan identitas.
- Pengajuan jadwal mandiri dengan pemeriksaan kuota serta verifikasi resepsionis.
- Pencarian pasien lama, pendaftaran walk-in, check-in, dan antrean oleh resepsionis.
- Pemeriksaan serta rekam medis dasar.
- Resep digital.
- Pemrosesan resep dan stok obat dasar.
- Dashboard/laporan sederhana untuk staf dan admin sesuai hak akses.

## 10. Fitur Tahap Lanjutan

- Verifikasi email/OTP dan pemulihan kata sandi.
- Akun keluarga/wali untuk mengelola pasien tanggungan.
- Reschedule dan pembatalan jadwal mandiri.
- Pengelolaan akun/role serta CRUD master data dokter dan poli.
- Pembayaran dan invoice.
- Integrasi WhatsApp atau SMS.
- Hasil laboratorium.
- Integrasi BPJS/asuransi.
- Rawat inap dan manajemen kamar.
- Laboratorium dan radiologi.
- Pengingat jadwal kontrol.
- Pengecekan interaksi obat yang lebih lengkap.
- Dashboard analitik yang lebih detail.

## 11. Stack Implementasi

- Frontend dan backend: Next.js + TypeScript
- UI: Tailwind CSS
- Database: PostgreSQL di Neon
- ORM: Prisma
- Autentikasi: sesi cookie HTTP-only dengan kontrol akses berbasis role
- Deployment: Vercel + Neon

## 12. Indikator Keberhasilan

- Resepsionis dapat mendaftarkan pasien baru dalam beberapa menit.
- Pasien dapat masuk ke antrean tanpa harus memiliki smartphone.
- Dokter dapat membuat rekam medis dan resep dalam satu alur.
- Apoteker dapat menyelesaikan resep dan stok obat otomatis berkurang.
- Admin dapat melihat ringkasan operasional harian.
