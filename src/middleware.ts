import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { canAccessApi, canAccessPath } from "@/lib/access";
import { SESSION_COOKIE_NAME } from "@/lib/session-config";
import { getUserFromToken } from "@/lib/session-store";


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  if (isApi && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && origin !== request.nextUrl.origin)) {
      return NextResponse.json({ error: "Asal permintaan tidak diizinkan." }, { status: 403 });
    }
  }

  // Lewati file statis, aset Next.js, dan endpoint API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images/") ||
    (isApi &&
      (["/api/auth/login", "/api/auth/register", "/api/auth/demo"].includes(pathname) ||
        pathname === "/api/public/catalog")) ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let user: { role: string; email: string } | null = null;

  if (token) {
    try {
      user = await getUserFromToken(token);
    } catch {
      // Token tidak valid atau kedaluwarsa
    }
  }

  // Jika sudah login tapi mengakses halaman /login, arahkan ke dashboard
  if (pathname === "/login") {
    if (user) {
      return NextResponse.redirect(new URL(user.role === "PATIENT" ? "/patient" : "/app", request.url));
    }
    return NextResponse.next();
  }

  // Beranda publik dan formulir pembuatan akun pasien tidak memerlukan sesi.
  if (pathname === "/" || pathname === "/register") {
    if (pathname === "/register" && user) {
      return NextResponse.redirect(new URL(user.role === "PATIENT" ? "/patient" : "/app", request.url));
    }
    return NextResponse.next();
  }

  // Jika belum login dan mengakses halaman selain /login, arahkan ke /login
  if (!user) {
    if (isApi) {
      return NextResponse.json({ error: "Sesi login diperlukan." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Pakai kebijakan role yang sama dengan sidebar untuk halaman dan API.
  const accessPath = isApi ? pathname.slice("/api".length) : pathname;
  if (!(isApi ? canAccessApi(accessPath, request.method, user.role) : canAccessPath(accessPath, user.role))) {
    if (isApi) {
      return NextResponse.json({ error: "Role tidak memiliki akses ke endpoint ini." }, { status: 403 });
    }
    const redirectUrl = new URL(user.role === "PATIENT" ? "/patient" : "/app", request.url);
    redirectUrl.searchParams.set("unauthorized", accessPath.replace(/^\//, ""));
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
