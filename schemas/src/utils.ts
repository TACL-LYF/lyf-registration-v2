/*
 * File containing utility functions for the schema library to
 */

import { CampTrack, CampTrackInfo, CampYear } from "./camp"

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
