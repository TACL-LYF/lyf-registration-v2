import React from "react"
import { PageProps } from "gatsby"
import { Stack, Typography } from "@mui/material"
import dayjs from "dayjs"

// Utils
import getPageTitle from "@utils/getPageTitle"

// Components
import PrivateRoute from "@components/Auth/PrivateRoute"
import { SnackbarAlertProvider } from "@components/SnackbarAlert"
import { TimeGated } from "@components/Layout"
import { LinkButton } from "@components/Button"
import { RegistrationFlow } from "@components/Registration"

// TODO: Replace this hardcoded list with a list of emails from Firebase or some other dynamic source.
// We're only including this functionality for people who missed the end of registration and need to
// bypass the time gating. We need better functionality for allowing specific people to bypass size restrictions.
const TEMP_ALLOWED_EMAILS = ["jeerhsu@gmail.com", "sloh4137@gmail.com"]

const RegistrationPage: React.FC<PageProps> = () => {
  return (
    <TimeGated
      hideAfterDateTime={dayjs("2026-04-20 12:00 AM", "YYYY-MM-DD h:mm A")}
      contentIfHidden={
        <Stack
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{ padding: 2 }}
        >
          <Typography variant="h3" textAlign="center">
            Registration for LYF Camp 2026 is now closed!
          </Typography>
          <LinkButton to="/" variant="contained">
            Return to Home Page
          </LinkButton>
        </Stack>
      }
      allowEmails={TEMP_ALLOWED_EMAILS}
    >
      <SnackbarAlertProvider>
        <PrivateRoute>
          {/* Used as a separate component to reduce the number of renders from not logged in */}
          <RegistrationFlow campYear={2026} />
        </PrivateRoute>
      </SnackbarAlertProvider>
    </TimeGated>
  )
}

export default RegistrationPage

export const Head = getPageTitle("Registration")
