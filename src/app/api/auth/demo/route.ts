import { NextResponse } from "next/server";
import { authenticateAsDemoRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { consumeRateLimit, rateLimitKey } from "@/lib/rate-limit";

const publicDemoRoles: Role[] = [Role.RECEPTIONIST, Role.DOCTOR, Role.PHARMACIST, Role.PATIENT];

export async function POST(req: Request) {
  const productionDemoEnabled = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  if (process.env.NODE_ENV === "production" && !productionDemoEnabled) {
    return NextResponse.json({ error: "Login demo dinonaktifkan." }, { status: 404 });
  }

  try {
    const { role } = await req.json();

    if (!role || !Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
    }
    if (process.env.NODE_ENV === "production" && !publicDemoRoles.includes(role as Role)) {
      return NextResponse.json({ error: "Role ini tidak tersedia untuk demo publik." }, { status: 403 });
    }

    const limit = await consumeRateLimit(rateLimitKey("demo-login", "public"), 200, 15 * 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Demo sedang ramai. Silakan coba lagi beberapa menit." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const result = await authenticateAsDemoRole(role as Role);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
