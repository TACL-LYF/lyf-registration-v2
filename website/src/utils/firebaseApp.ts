import { initializeApp } from "firebase/app"
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth"
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore"
import { connectFunctionsEmulator, getFunctions, type Functions } from "firebase/functions"

const USE_EMULATORS = process.env.GATSBY_USE_EMULATORS === "true"
const isBrowser = typeof window !== "undefined"

export const firebaseConfig = {
  apiKey: process.env.GATSBY_FIREBASE_API_KEY ?? "",
  authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.GATSBY_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.GATSBY_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.GATSBY_FIREBASE_APP_ID ?? "",
  measurementId: process.env.GATSBY_FIREBASE_MEASUREMENT_ID ?? "",
}
const firebaseApp = isBrowser ? initializeApp(firebaseConfig) : null

export default firebaseApp

export const firebaseAuth = isBrowser ? getAuth(firebaseApp!) : (null as unknown as Auth)
export const firestore = isBrowser ? getFirestore(firebaseApp!) : (null as unknown as Firestore)
export const prodFirestore = firestore
export const testFirestore = isBrowser ? getFirestore(firebaseApp!, "internal-test") : (null as unknown as Firestore)
export const firebaseFunctions = isBrowser ? getFunctions(firebaseApp!, "us-west2") : (null as unknown as Functions)

if (isBrowser && USE_EMULATORS) {
  connectFirestoreEmulator(firestore, "localhost", 8080)
  connectFirestoreEmulator(testFirestore, "localhost", 8080)
  connectAuthEmulator(firebaseAuth, "http://localhost:9099", { disableWarnings: true })
  connectFunctionsEmulator(firebaseFunctions, "localhost", 5001)
}
