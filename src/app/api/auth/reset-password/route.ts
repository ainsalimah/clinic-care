import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { consumeRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { resetPassword } from "@/features/accounts/server/passwords";
import { validatePassword } from "@/lib/password-rules";
export async function POST(req: Request) {
  try {
    const source = process.env.TRUSTED_CLIENT_IP_HEADER ? req.headers.get(process.env.TRUSTED_CLIENT_IP_HEADER) ?? "shared" : "shared";
    if (!(await consumeRateLimit(rateLimitKey("reset-confirm", source), 30, 15 * 60_000)).allowed) return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    const body = await req.json();
    if (typeof body.token !== "string" || !/^[a-f0-9]{64}$/.test(body.token)) return NextResponse.json({ error: "Tautan tidak valid atau sudah kedaluwarsa." }, { status: 400 });
    const passwordHash = await bcrypt.hash(validatePassword(body.password), 12);
    await prisma.$transaction(tx => resetPassword(tx, body.token, passwordHash));
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Tautan tidak valid/kedaluwarsa, atau kata sandi tidak memenuhi minimal 12 karakter dan maksimal 72 byte." }, { status: 400 }); }
}
