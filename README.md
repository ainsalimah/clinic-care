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
- **Admin:** pemantauan operasional dan laporan.

Pengajuan jadwal online tidak langsung membuat antrean. Pasien lama perlu meminta resepsionis memverifikasi dan menghubungkan akun ke data yang sudah ada. Akun baru memakai NIK dan telepon untuk pendaftaran online; resepsionis tetap dapat mendaftarkan pasien tanpa telepon. Portal pasien pada MVP hanya menampilkan dan mengajukan jadwal, belum membuka rekam medis atau resep. Rawat inap, laboratorium, radiologi, pembayaran, verifikasi OTP/email, dan integrasi eksternal belum termasuk MVP.

## Deployment produksi

Atur `DATABASE_URL` dan `AUTH_SECRET` acak minimal 32 karakter pada platform hosting. Jalankan `npm run db:deploy` sebelum `npm run start`; `prestart` menolak konfigurasi kosong atau nilai contoh. Bila memakai reverse proxy dan ingin rate limit berdasarkan IP, set `TRUSTED_CLIENT_IP_HEADER` hanya ke header yang selalu ditimpa oleh proxy tepercaya. Aktifkan HTTPS, backup database, monitoring error tanpa data medis, dan uji restore sebelum menerima pasien nyata.
