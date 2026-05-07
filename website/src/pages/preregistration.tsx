import React from "react"
import { PageProps } from "gatsby"
import { Stack, Typography } from "@mui/material"

// Utils
import getPageTitle from "@utils/getPageTitle"

// Components
import PrivateRoute from "@components/Auth/PrivateRoute"
import { SnackbarAlertProvider } from "@components/SnackbarAlert"
import CamperCheckoutFlow from "@components/CamperCheckoutFlow"
import { TimeGated } from "@components/Layout"
import { LinkButton } from "@components/Button"
import dayjs from "dayjs"

const PreRegistrationPage: React.FC<PageProps> = () => {
  return (
    <TimeGated
      hideAfterDateTime={dayjs("2025-08-04 12:00 AM", "YYYY-MM-DD h:mm A")}
      contentIfHidden={
        <Stack
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{ padding: 2 }}
        >
          <Typography variant="h3" textAlign="center">
            Pre-Registration for LYF Camp 2026 is now closed!
          </Typography>
          <Typography variant="h4" textAlign="center">
            General registration will begin in January 2026
          </Typography>
          <LinkButton to="/" variant="contained">
            Return to Home Page
          </LinkButton>
        </Stack>
      }
    >
      <SnackbarAlertProvider>
        <PrivateRoute>
          {/* Used as a separate component to reduce the number of renders from not logged in */}
          <CamperCheckoutFlow campYear={2025} hideCamperCheckout={true} />
        </PrivateRoute>
      </SnackbarAlertProvider>
    </TimeGated>
  )
}

export default PreRegistrationPage

export const Head = getPageTitle("Pre-Registration")
