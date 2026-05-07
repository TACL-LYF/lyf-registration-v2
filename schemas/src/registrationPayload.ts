// This file contains the schema for the payload the
// client will send to the server.

import { Camper, Demographics, Family, Parent, HouseholdCulture } from "./families"

import { Registration } from "./camp"

// Last updated for the 2026 camp registration
export type RegistrationData = {
  campYear: number
  family: Family
  parents: Parent[]
  campers: (Camper & Registration)[]
  demographics: Demographics[]
  donation: number
  household: HouseholdCulture
}

export type RegistrationPayload = RegistrationData & {
  // Needed to route the stripe checkout session back to the website
  successUrl: string
  cancelUrl: string
  isTestData?: boolean
  forceWaitlist?: boolean
}

export type RegistrationSessionResponse = {
  status?: string
  code?: number
  message?: string
  sessionId?: string | null
  isWaitlist?: boolean
}
