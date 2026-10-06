// Explicit seed identities: demo login must never select arbitrary users by role.
export const DEMO_ACCOUNTS = {
  ADMIN: "admin@klinikcare.com",
  RECEPTIONIST: "resepsionis@klinikcare.com",
  DOCTOR: "dokter.hendra@klinikcare.com",
  PHARMACIST: "apoteker@klinikcare.com",
  PATIENT: "pasien.sari@gmail.com",
} as const;
