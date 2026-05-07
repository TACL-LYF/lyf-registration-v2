import { DocumentReference } from "firebase/firestore"

import { Registration } from "./camp"

// Every type is defined with Partial since there's no strict schema in Firebase.
// Instead, every field is optional so these schemas are more of a guide.

// Families in Firebase are represented as a document with sub-collections for parents and campers.
// Hence why we don't link to campers or families here.
export type Family = Partial<{
  city: string
  // All of the emails that have admin access to this family.
  emails: string[]
  country: string
  state: string
  street: string
  suite: string
  zip: string
  // Culture within each household
  household: HouseholdCulture

  // Test Data
  isTestData: boolean
}>

export type Parent = Partial<{
  email: string
  firstName: string
  lastName: string
  lineId: string
  phoneNumber: string
  subscribeToMailingList: boolean
  stripeCustomerId: string
}>

export type Camper = Partial<{
  id: string
  firstName: string
  lastName: string
  preferredName: string | null
  birthDate: string

  gender: string[]
  pronouns: string | null

  dietAndFoodAllergies: string | null
  medicalConditions: string | null

  registrations: DocumentReference<Registration>[]

  // Going to move demographics onto the camper
  demographics: Demographics

  // Test Data
  isTestData: boolean
}>

// First added in 2023 as part of the Registration type.
// Eventually, we may want to move it onto the Camper document.
export type Demographics = Partial<{
  born: string
  ethnicity: string[]
  generation: string
  hakkaLanguage: string
  hokkienLanguage: string
  mandarinLanguage: string
  otherBackground: string
  otherLanguage: string
  immediateFamily: string
}>

// # Make these questions into options - multi-select / radio buttons
// 1. Camper message as part of culture activity / programming
// 2. How often is heritage language (Mandarin/Taiwanese Hokkien ) used at home
// 3. Confidence and familiarity in Taiwanese culture to share with kids
// 4. Interests in learning about Taiwanese culture
// 5  Any barriers to engaging with Taiwanese culture

// # Free form question to understand any desires from parents
// 6. What about culture would you hope is imparted onto your kids?
export type HouseholdCulture = Partial<{
  camperMessage: string
  languageFrequency: string
  cultureConfidence: string
  cultureLearn: string
  cultureBarrier: string
  cultureLesson: string
}>
