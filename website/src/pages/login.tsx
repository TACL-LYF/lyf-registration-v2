import React from "react"
import { navigate, PageProps } from "gatsby"

// Components
import { LoginFlow } from "@components/Auth"

// Utils
import AuthContext from "@components/Auth/AuthContext"
import getPageTitle from "@utils/getPageTitle"

const LoginPage: React.FC<PageProps> = () => {
  const { isSignedIn } = React.useContext(AuthContext)

  // If the user is already signed in, then we can redirect them
  // to the home page. Alternatively, once we create a profile page
  // we should redirect them there.
  if (isSignedIn) {
    navigate("/")
  }

  return <LoginFlow />
}

export default LoginPage

export const Head = getPageTitle("Login")
