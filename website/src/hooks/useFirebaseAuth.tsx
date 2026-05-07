import * as React from "react"

import { firebaseAuth, firestore } from "@utils/firebaseApp"
import {
  User,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { AdminRole } from "lyf-registration-schemas"

export type FirebaseAuthContext = {
  isSignedIn: boolean
  user: User | null
  isAdmin: boolean
  adminRole: AdminRole | null
  isAuthLoading: boolean
}

type AdminCheck = { isAdmin: boolean; role: AdminRole | null }

async function checkAdminStatus(email: string | null): Promise<AdminCheck> {
  if (!email) return { isAdmin: false, role: null }
  try {
    const adminDoc = await getDoc(doc(firestore, "admins", email))
    if (!adminDoc.exists()) return { isAdmin: false, role: null }
    return { isAdmin: true, role: adminDoc.data()?.role ?? "full_admin" }
  } catch {
    return { isAdmin: false, role: null }
  }
}

export default function useFirebaseAuth(): FirebaseAuthContext {
  const [isSignedIn, setIsSignedIn] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [adminRole, setAdminRole] = React.useState<AdminRole | null>(null)
  const [isAuthLoading, setIsAuthLoading] = React.useState(false)

  React.useEffect(() => {
    let email = window.localStorage.getItem("emailForSignIn")
    if (!isSignedIn && isSignInWithEmailLink(firebaseAuth, window.location.href)) {
      setIsAuthLoading(true)
      if (!email) {
        email = window.prompt("Please provide your email for confirmation")
      }

      signInWithEmailLink(firebaseAuth, email as string, window.location.href)
        .then((credential) => {
          setIsSignedIn(!!credential)
          setUser(credential.user)
          setIsAdmin(false)
          setAdminRole(null)
          checkAdminStatus(credential.user.email).then(({ isAdmin, role }) => {
            setIsAdmin(isAdmin)
            setAdminRole(role)
          })
        }).catch(() => console.log("Wrong email"))
        .finally(() => setIsAuthLoading(false))
    }

    const unregisterAuthObserver = firebaseAuth.onAuthStateChanged((user) => {
      setIsSignedIn(!!user)
      setUser(user)
      setIsAdmin(false)
      setAdminRole(null)
      checkAdminStatus(user?.email ?? null).then(({ isAdmin, role }) => {
        setIsAdmin(isAdmin)
        setAdminRole(role)
      })
    })
    return () => unregisterAuthObserver()
  }, [])

  return { isSignedIn, user, isAdmin, adminRole, isAuthLoading }
}
