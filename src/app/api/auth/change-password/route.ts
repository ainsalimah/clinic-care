import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, clearSession } from "@/lib/auth";
import { consumeRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { changePassword } from "@/features/accounts/server/passwords";

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Silakan masuk kembali." }, { status: 401 });
  const limit = await consumeRateLimit(rateLimitKey("password-change", user.id), 10, 15 * 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  try {
    const body = await req.json();
    await prisma.$transaction(tx => changePassword(tx, user.id, body.currentPassword, body.password), { maxWait: 10000, timeout: 15000 });
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal mengganti kata sandi." }, { status: 400 }); }
}
