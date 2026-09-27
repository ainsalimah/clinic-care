export const SESSION_COOKIE_NAME = "cliniccare_session";

export function getSessionSecret(): Uint8Array {
  const configuredSecret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32 || configuredSecret.startsWith("replace-with-"))) {
    throw new Error("AUTH_SECRET acak minimal 32 karakter wajib diatur pada lingkungan production.");
  }
  return new TextEncoder().encode(configuredSecret ?? "clinic-care-development-only-secret");
}
