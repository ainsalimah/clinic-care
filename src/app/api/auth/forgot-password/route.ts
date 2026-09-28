import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { consumeRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { issuePasswordReset } from "@/features/accounts/server/passwords";
import { resetEmailConfig, sendResetEmail } from "@/lib/reset-email";
const accepted = () => NextResponse.json({ message: "Jika email terdaftar dan akun aktif, tautan pengaturan ulang akan dikirim. Periksa kotak masuk dan spam." });
export async function POST(req: Request) {
  const config = resetEmailConfig();
  if (!config) return NextResponse.json({ error: "Pengiriman email pemulihan belum tersedia. Hubungi admin klinik." }, { status: 503 });
  try {
    const body = await req.json();
    if (typeof body.email !== "string" || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return NextResponse.json({ error: "Isi email yang valid." }, { status: 400 });
    const email = body.email.trim().toLowerCase();
    const source = process.env.TRUSTED_CLIENT_IP_HEADER ? req.headers.get(process.env.TRUSTED_CLIENT_IP_HEADER) ?? "shared" : "shared";
    const globalLimit = await consumeRateLimit(rateLimitKey("reset-source", source), 30, 15 * 60_000);
    if (!globalLimit.allowed) return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    if (!(await consumeRateLimit(rateLimitKey("reset-account", email), 3, 30 * 60_000)).allowed) return accepted();
    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.isActive) {
      const reset = await prisma.$transaction(tx => issuePasswordReset(tx, user.id));
      try { await sendResetEmail(email, reset.token, reset.id, config); }
      catch { await prisma.passwordReset.deleteMany({ where: { id: reset.id } }); console.error("Password reset email delivery failed"); }
    }
    return accepted();
  } catch { return NextResponse.json({ error: "Layanan pemulihan sedang bermasalah. Coba lagi nanti." }, { status: 503 }); }
}
