import { Timestamp } from "firebase/firestore"

export type AdminRole = "full_admin" | "program_staff" | "health_staff"

// Stored at: admins/{email}
export type Admin = Partial<{
  role: AdminRole
  addedBy: string
  addedAt: Timestamp
}>
