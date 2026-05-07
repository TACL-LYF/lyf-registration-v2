import { initializeApp } from "firebase/app"
import { connectAuthEmulator, getAuth } from "firebase/auth"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"
import { connectFunctionsEmulator, getFunctions } from "firebase/functions"

const USE_EMULATORS = process.env.GATSBY_USE_EMULATORS === "true"

export const firebaseConfig = {
  apiKey: process.env.GATSBY_FIREBASE_API_KEY ?? "",
  authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.GATSBY_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.GATSBY_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.GATSBY_FIREBASE_APP_ID ?? "",
  measurementId: process.env.GATSBY_FIREBASE_MEASUREMENT_ID ?? "",
}
const firebaseApp = initializeApp(firebaseConfig)

export default firebaseApp

export const firebaseAuth = getAuth(firebaseApp)
export const firestore = getFirestore(firebaseApp)
export const prodFirestore = firestore
export const testFirestore = getFirestore(firebaseApp, "internal-test")
export const firebaseFunctions = getFunctions(firebaseApp, "us-west2")

if (USE_EMULATORS) {
  connectFirestoreEmulator(firestore, "localhost", 8080)
  connectFirestoreEmulator(testFirestore, "localhost", 8080)
  connectAuthEmulator(firebaseAuth, "http://localhost:9099", { disableWarnings: true })
  connectFunctionsEmulator(firebaseFunctions, "localhost", 5001)
}
