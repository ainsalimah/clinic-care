import { NextResponse } from "next/server";
import { authenticateAsDemoRole } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  // Demo identities are intentionally available in development, never in production.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Login demo dinonaktifkan." }, { status: 404 });
  }

  try {
    const { role } = await req.json();

    if (!role || !Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
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
