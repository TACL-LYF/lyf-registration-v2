import { DocumentReference, Timestamp } from "firebase/firestore"
import { Camper } from "./families"
import { Payment } from "./payments"

// Every type is defined with Partial since there's no strict schema in Firebase.
// Instead, every field is optional and nullable so these schemas are more of a guide.

// Since 2025, camp has split into multiple tracks with different registration caps.
// It's entirely possible that we'll have even more tracks in the future, so rather than
// adding new fields to the CampYear type, we'll use a map with these as the keys.
export enum CampTrack {
  YOUNGER = "Younger",
  OLDER = "Older",
}

export type CampRemainingSpots = Record<CampTrack, number>

// Helper type to make it easier to correlate a camp track with its cap and remaining spots.
export type CampTrackInfo = {
  track: CampTrack
  cap: number
  remainingSpots: number
}

// Every CampYear document has a subcollection of registrations associated with it.
export type CampYear = Partial<{
  campEndDate: Timestamp
  campStartDate: Timestamp
  campTotalSizeCap: number
  campSizeCaps: Record<CampTrack, number>

  campsite: string
  campsiteAddress: string

  // Registration for those who are pre-registered
  earlyRegDiscount: number /* DEPRECATED */
  earlyRegEndDate: Timestamp
  earlyRegOpenDate: Timestamp

  name: string

  preRegistrationFee: number
  registrationCloseDate: Timestamp
  registrationFee: number
  registrationLateDate: Timestamp
  registrationLateFee: number
  registrationOpenDate: Timestamp /* Registration for general public */

  shirtPrice: number
  siblingDiscount: number

  // Used to determine at what point do we start waitlisting campers.
  // Purposely separate from campSizeCap because we don't want cancellations to open up spots that could bypass
  // the waitlist.
  remainingSpots: CampRemainingSpots
}>

export enum RegistrationStatus {
  ACTIVE = "Active",
  CANCELLED = "Cancelled",
  WAITLIST = "Waitlist",
  PENDING_PAYMENT = "Pending Payment",
  PARTIAL_PAYMENT = "Partial Payment",
  PROCESSING_PAYMENT = "Processing Payment",
}

// Information that changes year to year
export type Registration = Partial<{
  camperName: string
  camper: DocumentReference<Camper>
  campTrack: CampTrack /* Added in 2025 */

  grade: number
  isPreRegistered: boolean
  status: RegistrationStatus
  shirtSize: string
  isReturning: boolean
  smallGroup: string
  cabinPreference: string

  createdAt: Timestamp
  updatedAt: Timestamp
  waitlistTime: Timestamp

  // Linked Payments
  // Added in 2024, not present in past registrations
  payments: DocumentReference<Payment>[]

  // User-filled notes
  additionalNotes: string | null
  internalNotes: string | null

  // Waitlist
  hasContacted: true

  // Checkout
  checkedOutTime: Timestamp
  isCheckedOut: boolean
  nameOfParentCheckedOut: string

  // Waiver Signature
  waiverFullName: string
  waiverSignature: string
  waiverSignDate: string

  // DEPRECATED in schemaVersion 2: demographics now live at
  // families/{familyId}/campers/{camperId}/private/demographics (full_admin only).
  // Kept for reading pre-2026 registrations; do not write.
  demographics: Record<string, string | string[]>

  // Test Data
  isTestData: boolean

  // Denormalized from the parent family for Firestore rule ownership checks.
  // Always lowercase (see normalizeEmail in utils.ts).
  familyEmails: string[]

  // See CURRENT_SCHEMA_VERSION in utils.ts
  schemaVersion: number
}>
