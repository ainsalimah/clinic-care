# KlinikCare

Portfolio full-stack untuk **klinik rawat jalan dan apotek**. Pasien bisa mengajukan kunjungan dari website atau mendaftar langsung melalui resepsionis. Pengajuan online ditinjau resepsionis; nomor antrean baru diterbitkan saat pasien check-in.

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env` dan isi `DATABASE_URL` PostgreSQL.
2. Jalankan `npm install`.
3. Jalankan migrasi: `npx prisma migrate dev --name init`.
4. Isi data contoh: `npx prisma db seed`.
5. Jalankan aplikasi: `npm run dev`, lalu buka `http://localhost:3000`.

Website publik tersedia di `/` dengan informasi poli, dokter, jadwal praktik, dan FAQ. Pasien dapat membuat akun di `/register`, masuk ke `/login`, lalu mengajukan jadwal dari `/patient`. Dashboard staf tersedia di `/app` setelah login.

Pada database seed, akun demo staf memakai sandi `password123`. Akun pasien contoh adalah `pasien.sari@gmail.com` dengan sandi yang sama. Login cepat dan pemilih role staf hanya tersedia saat development.

## Peran aktif

- **Pasien:** daftar akun, lihat jadwal poli/dokter, dan ajukan kunjungan.
- **Resepsionis:** daftar pasien walk-in, verifikasi pengajuan online, check-in, dan antrean.
- **Dokter:** antrean praktik, pemeriksaan, rekam medis, dan resep.
- **Apoteker:** resep masuk, obat, stok, dan penyerahan.
- **Admin:** pemantauan operasional dan laporan.

Pengajuan jadwal online tidak langsung membuat antrean. Pasien lama dapat menghubungkan akunnya ke data yang sudah ada dengan NIK, nama, dan tanggal lahir yang cocok. Akun baru memakai NIK dan telepon untuk pendaftaran online; resepsionis tetap dapat mendaftarkan pasien tanpa telepon. Portal pasien pada MVP hanya menampilkan dan mengajukan jadwal, belum membuka rekam medis atau resep. Rawat inap, laboratorium, radiologi, pembayaran, verifikasi OTP/email, dan integrasi eksternal belum termasuk MVP.
