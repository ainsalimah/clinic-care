# KlinikCare

Portfolio full-stack untuk **klinik rawat jalan dan apotek**. Pasien bisa mengajukan kunjungan dari website atau mendaftar langsung melalui resepsionis. Pengajuan online ditinjau resepsionis; nomor antrean baru diterbitkan saat pasien check-in.

Demo production: [clinic-care-zeta.vercel.app](https://clinic-care-zeta.vercel.app)

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env` dan isi `DATABASE_URL` PostgreSQL serta `AUTH_SECRET` yang acak.
2. Jalankan `npm install`.
3. Jalankan migrasi: `npm run db:deploy` (database baru) lalu `npm run db:generate`. Untuk database development lama yang dibuat sebelum folder migrasi tersedia, sinkronkan satu kali dengan `npx prisma db push`.
4. Isi data contoh hanya pada database disposable: set `ALLOW_DEMO_SEED=true`, lalu jalankan `npx prisma db seed`. Seed menghapus seluruh data.
5. Jalankan aplikasi: `npm run dev`, lalu buka `http://localhost:3000`.

## Struktur kode

- `src/app`: rute Next.js, endpoint API, layout, dan CSS global. Rute publik, pasien, antrean, obat, dan farmasi menghubungkan halaman ke folder fitur.
- `src/features/<fitur>/components`: tampilan dan interaksi milik satu fitur, misalnya antrean, pasien, farmasi, inventaris, dan situs publik.
- `src/features/<fitur>/server`: logika server yang dipakai endpoint fitur tersebut.
- `src/features/<fitur>/types.ts`: bentuk data yang dipakai antarkomponen fitur.
- `src/lib`: utilitas lintas fitur seperti sesi, akses, waktu klinik, koneksi database, dan HTTP.
- `prisma`: skema database dan data contoh.

Jalankan `npm run lint`, `npm run typecheck`, dan `npm test` sebelum menggabungkan perubahan. Penomoran antrean memakai PostgreSQL advisory lock dalam transaksi; semua alur yang membuat antrean harus menggunakan `createQueue` dari `src/features/queue/server`.

Website publik tersedia di `/` dengan informasi poli, dokter, jadwal praktik, dan FAQ. Pasien dapat membuat akun di `/register`, masuk ke `/login`, lalu mengajukan jadwal dari `/patient`. Dashboard staf tersedia di `/app` setelah login.

Database seed hanya untuk development disposable. Kredensial demo tidak boleh dipakai pada produksi; login cepat dan pemilih role staf hanya tersedia saat development.

## Panggilan antrean bersuara

Setelah memperbarui kode pada database lokal yang sudah ada, jalankan `npx prisma db push` lalu `npx prisma generate` saat server development tidak sedang memakai Prisma Client. Pada database baru, langkah migrasi di atas akan membuat tabel panggilan otomatis dan pengumuman suara.

Petugas membuka `/queue/speaker` pada satu komputer yang tersambung ke speaker ruang tunggu, mengisi penempatan ruang tiap dokter, lalu menekan **Aktifkan Suara**. Tab ini harus tetap terbuka agar panggilan otomatis diproses dan dibacakan. Panggilan manual serta panggilan ulang masuk ke speaker yang sama. Setelah dokter menyelesaikan pemeriksaan, panggilan pasien berikutnya dijadwalkan 10 detik kemudian; dokter dapat membatalkannya selama hitung mundur. Jika speaker belum aktif, panggilan tertunda sampai layar speaker aktif lagi.

## Peran aktif

- **Pasien:** daftar akun, lihat jadwal poli/dokter, dan ajukan kunjungan.
- **Resepsionis:** daftar pasien walk-in, verifikasi pengajuan online, check-in, dan antrean.
- **Dokter:** antrean praktik, pemeriksaan, rekam medis, dan resep.
- **Apoteker:** resep masuk, obat, stok, dan penyerahan.
- **Admin:** pemantauan operasional, laporan, tarif, dan akun staf.

Pengajuan jadwal online tidak langsung membuat antrean. Pasien lama perlu meminta resepsionis memverifikasi dan menghubungkan akun ke data yang sudah ada. Akun baru memakai NIK dan telepon untuk pendaftaran online; resepsionis tetap dapat mendaftarkan pasien tanpa telepon. Portal pasien menampilkan jadwal, status kunjungan, dan ringkasan tagihan; rekam medis dan resep belum dibuka di portal. Rawat inap, laboratorium, radiologi, verifikasi OTP/email, dan integrasi eksternal belum termasuk MVP.

## Kasir apotek dan tagihan kunjungan

Pemeriksaan baru yang diselesaikan dokter menghasilkan satu tagihan berisi konsultasi dan obat (jika ada). Kunjungan lama tidak ditagih ulang. Harga, nama layanan/obat, satuan, jumlah, dan identitas pasien disimpan saat tagihan dibuat.

Admin mengatur tarif per dokter di **Tarif Konsultasi** (`/admin/fees`), dengan nilai awal Rp100.000. Apoteker membuka **Kasir Apotek** pada `/pharmacy`, menyiapkan resep sampai siap diambil, lalu menerima pembayaran tunai atau memverifikasi QRIS secara manual. Pembayaran QRIS ini bukan integrasi payment gateway dan tidak menghasilkan QR pembayaran.

Pembayaran dan penyerahan obat adalah dua langkah terpisah. Pembayaran mengalokasikan stok; penyerahan mengurangi stok fisik satu kali. Pasien tanpa resep cukup melunasi konsultasi. Portal pasien menunjukkan apakah masih menunggu pembayaran, menunggu obat, atau sudah selesai. Struk mencantumkan rincian item, total, metode, uang diterima, kembalian, waktu, dan petugas.

Rincian awal tagihan tetap tersimpan. Apoteker dapat mengajukan koreksi nominal sebelum pembayaran, atau refund setelah pembayaran lewat rincian tagihan. Admin menyetujui/menolak pada **Pembayaran & Koreksi** dengan catatan wajib. Selama koreksi menunggu keputusan, pembayaran ditunda.

Refund yang disetujui belum dianggap uang keluar. Apoteker harus mencatat uang yang benar-benar dikembalikan (tunai/transfer) berikut nomor bukti atau tanda terima. Refund tidak mengubah resep, status penyerahan, atau stok. Penggantian obat, pembatalan layanan, dan retur fisik obat tetap memerlukan alur terpisah; fitur ini menangani koreksi biaya dan pengembalian uang.

Laporan **Pembayaran & Koreksi** tersedia untuk admin dan apoteker, dengan rentang maksimal 31 hari dalam WIB. Uang masuk mengikuti tanggal pembayaran, uang keluar mengikuti tanggal refund diserahkan. Laporan memisahkan konsultasi, obat, koreksi, tunai/QRIS, refund, serta tagihan belum lunas dan dapat dicetak.

Jika stok resep tidak mencukupi, apoteker menunda resep dengan alasan. Resep, pembayaran, dan penyerahan baru dapat dilanjutkan setelah stok tersedia. Pasien melihat status menunggu stok pada portalnya.

Admin dapat membuat dan menonaktifkan akun staf di **Akun Staf**. Pembuatan atau perubahan status memerlukan konfirmasi password admin; akun sendiri tidak dapat dinonaktifkan dan sesi akun yang dinonaktifkan langsung dicabut. Staf baru wajib mengganti password awal. Semua pengguna dapat mengganti password sendiri, sedangkan lupa password memakai tautan sekali pakai yang berlaku 30 menit dan mencabut seluruh sesi lama.

Jika email pemulihan belum dapat digunakan, admin membuka **Pemulihan Pasien**, mencari akun, lalu mencocokkan NIK, tanggal lahir, dan nomor telepon yang disebutkan pasien. Setelah verifikasi, admin dapat memberitahukan email akun atau membuat password sementara. Reset mencabut seluruh sesi dan tautan reset lama; pasien wajib mengganti password sementara saat login.

Verifikasi: `npm test` dan `npm run test:billing:integration`. Uji integrasi membutuhkan database yang sudah dimigrasikan; semua data sintetis berada dalam transaksi yang di-rollback.

Uji alur endpoint lengkap: jalankan server lokal, lalu `npm run test:visit:e2e`. Skrip menolak alamat server nonlokal, membuat data sintetis unik untuk seluruh role, menguji pendaftaran sampai refund/laporan, lalu membersihkan hanya data run tersebut. Gunakan database pengujian terpisah bila menjalankan di luar lingkungan demo.

## Konfigurasi hosting

Atur `DATABASE_URL` dan `AUTH_SECRET` acak minimal 32 karakter pada platform hosting. Untuk lupa password, verifikasi domain pengirim di Resend lalu atur `RESEND_API_KEY`, `AUTH_EMAIL_FROM`, dan `APP_BASE_URL` HTTPS. Tanpa ketiganya, halaman pemulihan memberi tahu pengguna untuk menghubungi admin dan tidak membuat token reset. Jalankan `npm run db:deploy` sebelum `npm run start`; `prestart` menolak konfigurasi inti yang kosong atau memakai nilai contoh. Bila memakai reverse proxy dan ingin rate limit berdasarkan IP, set `TRUSTED_CLIENT_IP_HEADER` hanya ke header yang selalu ditimpa oleh proxy tepercaya. Aktifkan HTTPS, backup database, monitoring error tanpa data medis, dan uji restore sebelum menerima pasien nyata.
