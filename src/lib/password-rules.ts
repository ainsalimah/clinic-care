export function validatePassword(value: unknown): string {
  if (typeof value !== "string" || value.length < 12 || new TextEncoder().encode(value).length > 72) {
    throw new Error("Gunakan minimal 12 karakter, maksimal 72 byte untuk kata sandi baru.");
  }
  return value;
}
