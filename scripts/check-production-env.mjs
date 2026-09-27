import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd(), false);
const secret = process.env.AUTH_SECRET;
if (!secret || secret.length < 32 || secret.startsWith('replace-with-')) {
  throw new Error('Konfigurasi AUTH_SECRET acak minimal 32 karakter sebelum menjalankan produksi.');
}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL wajib diatur.');
console.log('Konfigurasi environment produksi tersedia.');
