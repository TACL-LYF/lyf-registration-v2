import { useState, useEffect } from "react"
import { Firestore } from "firebase/firestore"
import { prodFirestore, testFirestore } from "@utils/firebaseApp"
import { GetStripePromise, getStripeProd, getStripeTest } from "@utils/stripe"

export type ProdContextType = {
  isProd: boolean
  isTestData: boolean
  setIsProd: React.Dispatch<boolean>
  firestore: Firestore
  getStripe: GetStripePromise
}

/**
 * Should be called at the top-level app context in order to set and get the production context for the app.
 * Has options for Firebase datbase context.
 * @returns The production context for the app
 */
export default function useProduction(): ProdContextType {
  const isOnTestDomain =
    typeof window !== "undefined" && window?.location?.hostname === "localhost"
  const [isProd, setIsProd] = useState(!isOnTestDomain)

  const firestore = isProd ? prodFirestore : testFirestore
  const getStripe = isProd ? getStripeProd : getStripeTest

  return {
    isProd,
    isTestData: !isProd,
    setIsProd,
    firestore,
    getStripe,
  }
}
