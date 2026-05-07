import React from "react"
import { CircularProgress, Stack, Typography } from "@mui/material"

// Utils
import AuthContext from "./AuthContext"

// Components
import LoginFlow from "./LoginFlow"
import { SnackbarAlertProvider } from "@components/SnackbarAlert"

type PrivateRouteProps = React.PropsWithChildren

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isSignedIn, isAuthLoading } = React.useContext(AuthContext)

  // If the user is signed in, then display the page.
  // If we're in the middle of authenticating a request, then show the loading screen.
  // Otherwise, show the sign in flow.
  return (
    <SnackbarAlertProvider>
      {isSignedIn ? (
        children
      ) : isAuthLoading ? (
        <Stack
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{ height: "50vh", width: 1, padding: 1 }}
        >
          <Typography variant="h6" color="primary" textAlign="center">
            Authenticating...
          </Typography>
          <CircularProgress color="primary" />
        </Stack>
      ) : (
        <LoginFlow />
      )}
    </SnackbarAlertProvider>
  )
}
