import { NextResponse } from "next/server";
import { authenticateWithCredentials } from "@/lib/auth";
import { limitAuthRequest } from "@/lib/rate-limit";
import { getSessionSecret } from "@/lib/session-config";

export async function POST(req: Request) {
  try {
    getSessionSecret();
    const { email, password } = await req.json();

    if (typeof email !== "string" || email.length > 254 || typeof password !== "string" || !password || Buffer.byteLength(password) > 72 || !email.trim()) {
      return NextResponse.json(
        { error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const limited = await limitAuthRequest(req, "login", email);
    if (limited) return limited;
    const result = await authenticateWithCredentials(email, password);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
