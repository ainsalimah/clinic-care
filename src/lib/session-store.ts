import { jwtVerify } from "jose";
import prisma from "./prisma";
import { getSessionSecret } from "./session-config";

/** A valid signature alone is insufficient: logout, inactive accounts and role changes revoke access. */
export async function getUserFromToken(token: string) {
  let sessionId: string;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), { algorithms: ["HS256"] });
    if (!payload.jti) return null;
    sessionId = payload.jti;
  } catch {
    return null;
  }
  const session = await prisma.authSession.findUnique({ where: { id: sessionId }, include: { user: true } });
  if (!session || session.expiresAt <= new Date()) return null;
  const { user } = session;
  if (!user.isActive || user.role !== session.role || user.updatedAt > session.createdAt) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
