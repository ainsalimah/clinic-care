import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

const COOKIE_NAME = "cliniccare_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "clinic-care-super-secret-key-2026-secure"
);

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/**
 * Sign JWT token
 */
export async function encryptToken(payload: SessionUser): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token
 */
export async function decryptToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Get current session user from cookies
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await decryptToken(token);
  } catch {
    return null;
  }
}

/**
 * Set session cookie
 */
export async function setSession(user: SessionUser) {
  const token = await encryptToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clear session cookie
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Authenticate with email & password
 */
export async function authenticateWithCredentials(email: string, passwordPlain: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || !user.isActive) {
    return { success: false, error: "Email tidak ditemukan atau akun dinonaktifkan." };
  }

  const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "Kata sandi salah. Silakan coba lagi." };
  }

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  await setSession(sessionUser);
  return { success: true, user: sessionUser };
}

/**
 * Quick Login as Demo Role (for testing & demo purposes)
 */
export async function authenticateAsDemoRole(targetRole: Role) {
  const user = await prisma.user.findFirst({
    where: { role: targetRole, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (!user) {
    return { success: false, error: `Akun demo untuk role ${targetRole} tidak ditemukan.` };
  }

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  await setSession(sessionUser);
  return { success: true, user: sessionUser };
}
