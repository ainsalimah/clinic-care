import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
const file = '.env';
const content = existsSync(file) ? readFileSync(file, 'utf8') : '';
if (!/^AUTH_SECRET\s*=\s*["']?[^\s"']+/m.test(content)) {
  const withoutEmptySecret = content.replace(/^AUTH_SECRET\s*=.*$/gm, '');
  writeFileSync(file, `${withoutEmptySecret.trimEnd()}\nAUTH_SECRET="${randomBytes(48).toString('base64url')}"\n`);
  console.log('AUTH_SECRET lokal dibuat; nilainya tidak ditampilkan.');
} else console.log('AUTH_SECRET yang sudah ada dipertahankan.');
