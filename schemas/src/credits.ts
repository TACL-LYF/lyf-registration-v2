/**
 * Camp credits for anything ranging from refunds to financial aid
 *
 * ID should be the familyId
 */
import { DocumentReference } from "firebase/firestore"
import { Family } from "./families"

export type CampCredit = Partial<{
  amountRemaining: number
  family: DocumentReference<Family>

  // Notes should be in the format
  // +[amount]: [year] [reason]
  notes: string[]
}>
