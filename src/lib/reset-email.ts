export function resetEmailConfig() {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  const raw = process.env.APP_BASE_URL;
  if (!key || !from || !raw) return null;
  try {
    const base = new URL(raw);
    if (base.protocol !== "https:" || base.username || base.password) return null;
    return { key, from, base: base.origin };
  } catch { return null; }
}

export async function sendResetEmail(email: string, token: string, id: string, config: NonNullable<ReturnType<typeof resetEmailConfig>>) {
  // Fragment keeps the token out of HTTP access logs and Referer headers.
  const link = `${config.base}/reset-password#token=${token}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${config.key}`, "Content-Type": "application/json", "Idempotency-Key": `password-reset/${id}` },
    body: JSON.stringify({ from: config.from, to: [email], subject: "Atur ulang kata sandi KlinikCare", text: `Buka tautan ini untuk mengatur ulang kata sandi KlinikCare:\n\n${link}\n\nTautan berlaku 30 menit dan hanya dapat dipakai sekali. Jika kamu tidak meminta perubahan ini, abaikan email ini.` }),
  });
  if (!response.ok) throw new Error("Email delivery failed");
}
