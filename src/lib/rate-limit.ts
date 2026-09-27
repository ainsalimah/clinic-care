import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import prisma from "./prisma";

export function rateLimitKey(scope: string, identity: string) {
  return createHash("sha256").update(`${scope}:${identity.trim().toLowerCase()}`).digest("hex");
}

export function retryAfterSeconds(expiresAt: Date, now = new Date()) {
  return Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000));
}

/** Shared fixed window, updated atomically in PostgreSQL across app instances. */
export async function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const rows = await prisma.$queryRaw<{ count: number; expiresAt: Date }[]>`
    INSERT INTO "AuthRateLimit" ("key", "count", "expiresAt")
    VALUES (${key}, 1, NOW() + ${windowMs} * INTERVAL '1 millisecond')
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "AuthRateLimit"."expiresAt" <= NOW() THEN 1 ELSE LEAST("AuthRateLimit"."count" + 1, ${limit + 1}) END,
      "expiresAt" = CASE WHEN "AuthRateLimit"."expiresAt" <= NOW() THEN NOW() + ${windowMs} * INTERVAL '1 millisecond' ELSE "AuthRateLimit"."expiresAt" END
    RETURNING "count", "expiresAt"`;
  return { allowed: rows[0].count <= limit, retryAfter: retryAfterSeconds(rows[0].expiresAt) };
}

export async function limitAuthRequest(req: Request, scope: "login" | "register", email: string) {
  // Only trust a header explicitly configured for a proxy that overwrites it.
  const ipHeader = process.env.TRUSTED_CLIENT_IP_HEADER;
  const source = ipHeader ? req.headers.get(ipHeader)?.split(",")[0].trim() || "unknown" : "shared";
  const checks = [
    { key: rateLimitKey(`${scope}:source`, source), limit: scope === "login" ? 60 : 20 },
    { key: rateLimitKey(`${scope}:account`, email), limit: scope === "login" ? 10 : 5 },
  ];
  for (const check of checks) {
    const result = await consumeRateLimit(check.key, check.limit, 15 * 60_000);
    if (!result.allowed) return NextResponse.json(
      { error: "Terlalu banyak percobaan. Silakan coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
    );
  }
  return null;
}
