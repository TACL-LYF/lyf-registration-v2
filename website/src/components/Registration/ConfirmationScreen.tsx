import React from "react"
import { Stack, Typography } from "@mui/material"
import { AnimatedLinkButton } from "@components/Button"
import { Sparkles } from "@components/Sparkles"
import { ThankYouBearSVG } from "@components/SVG"
import { Link } from "gatsby"

type ConfirmationScreenProps = {
  campYear: number
  hasWaitlist: boolean
}

export default function ConfirmationScreen({
  campYear,
  hasWaitlist,
}: ConfirmationScreenProps) {
  return (
    <>
      <Stack spacing={4} alignItems="center">
        <Typography variant="h3" textAlign="center">
          You're All Set!
        </Typography>
        <Typography variant="h5" textAlign="center">
          Thank you for registering for TACL-LYF Camp {campYear}!
        </Typography>
        {hasWaitlist && (
          <Typography variant="h5" textAlign="center">
            One or more of your campers is on the waitlist.
            <br />
            You may check your status on the waitlist by visiting your{" "}
            <Link to="/user/profile">registration dashboard</Link> at any time.
          </Typography>
        )}
        <Sparkles>
          <ThankYouBearSVG scale={0.6} />
        </Sparkles>
        <Typography variant="h6" textAlign="center">
          If you didn't receive a confirmation email, please contact
          lyf@tacl.org
        </Typography>
        <AnimatedLinkButton
          to="/"
          color="secondary"
          variant="outlined"
          boopProps={{
            scale: 1.1,
          }}
        >
          Back to Website
        </AnimatedLinkButton>
        <AnimatedLinkButton
          to="/user/profile"
          color="secondary"
          variant="contained"
          boopProps={{
            scale: 1.1,
          }}
        >
          View Registrations
        </AnimatedLinkButton>
      </Stack>
    </>
  )
}
