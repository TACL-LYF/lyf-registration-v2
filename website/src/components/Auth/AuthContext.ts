import { createContext } from "react"

import { FirebaseAuthContext } from "@hooks/useFirebaseAuth"

const AuthContext = createContext<FirebaseAuthContext>({
  isSignedIn: false,
  user: null,
  isAdmin: false,
  adminRole: null,
  isAuthLoading: false
})

export default AuthContext