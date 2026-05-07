import * as React from "react"

import { firebaseAuth } from "@utils/firebaseApp"
import {
  User,
  getRedirectResult,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth"

export type FirebaseAuthContext = {
  isSignedIn: boolean
  user: User | null
  isAdmin: boolean
  isAuthLoading: boolean
}

export default function useFirebaseAuth(): FirebaseAuthContext {
  const [isSignedIn, setIsSignedIn] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [isAuthLoading, setIsAuthLoading] = React.useState(false)

  // Listen to the Firebase Auth state and set the local state.
  React.useEffect(() => {
    let email = window.localStorage.getItem("emailForSignIn")
    if (!isSignedIn && isSignInWithEmailLink(firebaseAuth, window.location.href)) {
      setIsAuthLoading(true)
      if (!email) {
        email = window.prompt("Please provide your email for confirmation")
      }

      signInWithEmailLink(firebaseAuth, email as string, window.location.href)
        .then((user) => {
          // Seeing a bug where we require this on a refresh for some reason.
          // window.localStorage.removeItem("emailForSignIn")
          setIsSignedIn(!!user)
          setUser(user.user)
          // Default to admin false on every auth state change and only update if the claim is present.
          setIsAdmin(false)
          user.user
            .getIdTokenResult()
            .then((result) => setIsAdmin(!!result.claims.admin))
        }).catch(() => console.log("Wrong email"))
        .finally(() => setIsAuthLoading(false))
    }

    // Register an observer that listens for any auth state changes.
    const unregisterAuthObserver = firebaseAuth.onAuthStateChanged((user) => {
      setIsSignedIn(!!user)
      setUser(user)

      // Default to admin false on every auth state change and only update if the claim is present.
      setIsAdmin(false)
      user
        ?.getIdTokenResult()
        .then((result) => setIsAdmin(!!result.claims.admin))
    })
    return () => unregisterAuthObserver() // Make sure we un-register Firebase observers when the component unmounts.
  }, [])

  return { isSignedIn, user, isAdmin, isAuthLoading }
}
