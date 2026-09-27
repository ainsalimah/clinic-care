export type AppRole = "ADMIN" | "RECEPTIONIST" | "DOCTOR" | "PHARMACIST" | "PATIENT";

/** One route policy used by the sidebar and middleware for both pages and APIs. */
export const ROUTE_ACCESS: { prefix: string; roles: AppRole[] }[] = [
  { prefix: "/app", roles: ["ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST"] },
  { prefix: "/patient", roles: ["PATIENT"] },
  { prefix: "/appointments", roles: ["RECEPTIONIST"] },
  { prefix: "/doctor/examine", roles: ["DOCTOR"] },
  { prefix: "/patients/new", roles: ["RECEPTIONIST"] },
  { prefix: "/medicines", roles: ["ADMIN", "PHARMACIST"] },
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/queue", roles: ["ADMIN", "RECEPTIONIST"] },
  { prefix: "/doctor", roles: ["DOCTOR"] },
  { prefix: "/records", roles: ["DOCTOR"] },
  { prefix: "/pharmacy", roles: ["PHARMACIST"] },
  { prefix: "/patients", roles: ["ADMIN", "RECEPTIONIST"] },
];

export function canAccessPath(pathname: string, role: string): boolean {
  const policy = ROUTE_ACCESS.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return !policy || policy.roles.includes(role as AppRole);
}

const API_ACCESS: { prefix: string; roles: AppRole[]; methods?: string[] }[] = [
  { prefix: "/bills", roles: ["PHARMACIST"], methods: ["GET", "POST"] },
  { prefix: "/doctor-fees", roles: ["ADMIN"], methods: ["GET", "PATCH"] },
  { prefix: "/auth/me", roles: ["ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "PATIENT"], methods: ["GET"] },
  { prefix: "/auth/logout", roles: ["ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "PATIENT"], methods: ["POST"] },
  { prefix: "/departments", roles: ["ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "PATIENT"], methods: ["GET"] },
  { prefix: "/patient/availability", roles: ["PATIENT"], methods: ["GET"] },
  { prefix: "/patient/appointments", roles: ["PATIENT"] },
  { prefix: "/appointments", roles: ["RECEPTIONIST"], methods: ["GET"] },
  { prefix: "/appointments", roles: ["RECEPTIONIST"], methods: ["PATCH"] },
  { prefix: "/doctor/examination", roles: ["DOCTOR"] },
  { prefix: "/queue-auto-calls", roles: ["DOCTOR"] },
  { prefix: "/queue-announcements", roles: ["ADMIN", "RECEPTIONIST"] },
  { prefix: "/doctor-rooms", roles: ["ADMIN", "RECEPTIONIST"] },
  { prefix: "/queues/check-in", roles: ["RECEPTIONIST"] },
  { prefix: "/records", roles: ["DOCTOR"], methods: ["GET"] },
  { prefix: "/admin/reports", roles: ["ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST"] },
  { prefix: "/prescriptions", roles: ["PHARMACIST"], methods: ["GET"] },
  { prefix: "/prescriptions", roles: ["PHARMACIST"], methods: ["PATCH"] },
  { prefix: "/medicines", roles: ["ADMIN", "DOCTOR", "PHARMACIST"], methods: ["GET"] },
  { prefix: "/medicines", roles: ["PHARMACIST"], methods: ["POST"] },
  { prefix: "/medicines/", roles: ["PHARMACIST"], methods: ["POST"] },
  { prefix: "/queues", roles: ["ADMIN", "RECEPTIONIST", "DOCTOR"], methods: ["GET"] },
  { prefix: "/queues", roles: ["RECEPTIONIST", "DOCTOR"], methods: ["PATCH"] },
  { prefix: "/patients", roles: ["ADMIN", "RECEPTIONIST"], methods: ["GET"] },
  { prefix: "/patients", roles: ["RECEPTIONIST"], methods: ["POST"] },
];

export function canAccessApi(pathname: string, method: string, role: string): boolean {
  const policies = API_ACCESS.filter(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!policies.length) return false;
  const policy = policies.find(({ methods }) => !methods || methods.includes(method));
  if (!policy) return false;
  return policy.roles.includes(role as AppRole);
}
