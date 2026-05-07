import React from "react"
import { CircularProgress, Container, Grid, Typography } from "@mui/material"

// Components
import { AnimatedButton } from "@components/Button"
import { ChevronLeft, ChevronRight } from "@mui/icons-material"

// Utils
import CheckoutFlowContext from "./CheckoutFlowContext"

type CheckoutFlowStepProps = React.PropsWithChildren<{
  index: number
  title?: string
  hideBack?: boolean
  hideContinue?: boolean
  disableBack?: boolean
  disableContinue?: boolean
  backText?: string
  continueText?: string
  continueHandler?: () => Promise<void>
}>

export default function CheckoutFlowStep({
  index,
  title,
  hideBack = false,
  hideContinue = false,
  disableBack = false,
  disableContinue = false,
  backText = "Back",
  continueText = "Continue",
  continueHandler,
  children,
}: CheckoutFlowStepProps) {
  const { setActiveStep } = React.useContext(CheckoutFlowContext)
  const [loading, setLoading] = React.useState(false)

  const handleContinue = async () => {
    if (continueHandler) {
      setLoading(true)
      try {
        await continueHandler()
      } finally {
        setLoading(false)
      }
    }

    setActiveStep(index + 1)
  }

  const ContinueButton = (
    <AnimatedButton
      boopProps={{ scale: 1.01, x: 3 }}
      onClick={handleContinue}
      variant="contained"
      fullWidth
      startIcon={loading && <CircularProgress size={25} color="inherit" />}
      endIcon={<ChevronRight />}
      disabled={loading || disableContinue}
    >
      {continueText}
    </AnimatedButton>
  )

  const BackButton = (
    <AnimatedButton
      boopProps={{ scale: 1.01, x: -3 }}
      onClick={() => setActiveStep(index - 1)}
      variant="outlined"
      fullWidth
      startIcon={<ChevronLeft />}
      disabled={loading || disableBack}
    >
      {backText}
    </AnimatedButton>
  )

  return (
    <Container maxWidth="lg">
      {title && (
        <Typography variant="h5" textAlign="center">
          {title}
        </Typography>
      )}
      {children}
      <Grid
        container
        justifyContent={"center"}
        spacing={1}
        sx={{
          paddingTop: 2,
        }}
      >
        {!hideBack && (
          <Grid
            size={{
              md: 6,
              xl: 4,
            }}
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
            }}
          >
            {BackButton}
          </Grid>
        )}

        {!hideContinue && (
          <Grid size={{ xs: 12, md: 6, xl: 4 }}>{ContinueButton}</Grid>
        )}
        {!hideBack && (
          <Grid
            size={12}
            sx={{
              display: {
                xs: "block",
                md: "none",
              },
            }}
          >
            {BackButton}
          </Grid>
        )}
      </Grid>
    </Container>
  )
}
