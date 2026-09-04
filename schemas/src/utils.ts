/*
 * File containing utility functions for the schema library to
 */

import { CampTrack, CampTrackInfo, CampYear } from "./camp"

/**
 * Current version of the Firestore document schema. Bump when the shape of
 * family/camper/registration documents changes, and stamp it on writes so
 * future migrations can tell document generations apart instead of
 * inferring state from field presence.
 *
 * Version history:
 *   1 (implicit) — 2023-2025 layout: health + demographics inline on camper docs
 *   2 — RBAC revamp: health/demographics moved to private/ sub-documents,
 *       familyEmails denormalized onto registrations, emails normalized lowercase
 */
export const CURRENT_SCHEMA_VERSION = 2

/**
 * Canonical form for emails used as identity keys (family membership,
 * admins/{email} doc IDs, registration familyEmails). Every write and every
 * comparison must go through this so Firestore rules' exact-match `in`
 * checks against request.auth.token.email behave consistently.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function normalizeEmails(emails: (string | undefined | null)[]): string[] {
  return [...new Set(emails.filter((e): e is string => !!e).map(normalizeEmail))]
}

/**
 * Given a camper's grade, return the camp track that they're assigned to
 * @param grade Integer representing the camper's grade
 * @returns CampTrack enum
 */
export function getCampTrack(grade: number): CampTrack {
  return grade <= 7 ? CampTrack.YOUNGER : CampTrack.OLDER
}

export function getRegistrationPrice(
  campYearInfo: CampYear,
  nowInMs: number = Date.now()
): number {
  const { registrationLateDate, registrationFee, registrationLateFee } =
    campYearInfo

  const isLate =
    registrationLateDate && nowInMs > registrationLateDate.toMillis()
  const price =
    isLate && registrationLateFee ? registrationLateFee : registrationFee
  return price ?? 0
}

/**
 * Given a camp year info, return the tracks that are available for that camp
 * @param campYearInfo
 */
export function getCampTracksFromCamp(campYearInfo: CampYear): CampTrackInfo[] {
  const { campSizeCaps, remainingSpots } = campYearInfo

  if (!campSizeCaps || !remainingSpots) {
    return []
  }

  return Object.entries(campSizeCaps).map(([track, cap]) => ({
    track: track as CampTrack,
    cap: cap,
    // Math.max here to ensure we bottom out at 0
    remainingSpots: Math.max(remainingSpots[track as CampTrack] ?? 0, 0),
  }))
}
