import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore,  } from "firebase/firestore"
import { getFunctions } from "firebase/functions"

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
export const prodFirestore = getFirestore(firebaseApp)
export const testFirestore = getFirestore(firebaseApp, "internal-test")
export const firebaseFunctions = getFunctions(firebaseApp, "us-west2")
