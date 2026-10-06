import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { getSessionSecret, SESSION_COOKIE_NAME } from "./session-config";
import { getUserFromToken } from "./session-store";
import { randomUUID } from "node:crypto";
import { DEMO_ACCOUNTS } from "./demo-accounts";


export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  mustChangePassword?: boolean;
}

/**
 * Sign JWT token
 */
export async function encryptToken(payload: SessionUser): Promise<string> {
  const secret = getSessionSecret();
  const id = randomUUID();
  await prisma.authSession.create({ data: { id, userId: payload.id, role: payload.role, expiresAt: new Date(Date.now() + 7 * 86400_000) } });
  return await new SignJWT({ ...payload })
    .setJti(id)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * Verify JWT token
 */
export async function decryptToken(token: string): Promise<SessionUser | null> {
  return getUserFromToken(token);
}

/**
 * Get current session user from cookies
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
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
  cookieStore.set(SESSION_COOKIE_NAME, token, {
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
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    let id: string | undefined;
    try { id = (await jwtVerify(token, getSessionSecret(), { algorithms: ["HS256"] })).payload.jti; } catch { /* Invalid cookies can still be removed. */ }
    if (id) await prisma.authSession.deleteMany({ where: { id } });
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Authenticate with email & password
 */
export async function authenticateWithCredentials(email: string, passwordPlain: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  const isValid = await bcrypt.compare(passwordPlain, user?.passwordHash ?? "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy");
  if (!user || !user.isActive || !isValid) {
    return { success: false, error: "Email atau kata sandi tidak valid." };
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
  const user = await prisma.user.findUnique({
    where: { email: DEMO_ACCOUNTS[targetRole] },
  });

  if (!user || !user.isActive || user.role !== targetRole) {
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
