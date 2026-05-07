import React from "react"
import { ButtonProps, Grid, Typography } from "@mui/material"
import { ArrowBack, ArrowForward } from "@mui/icons-material"
import { config } from "@react-spring/web"
import useScrollTo from "react-spring-scroll-to-hook"

import { AnimatedButton } from "@components/Button"
import CheckoutFlowContext from "@components/CheckoutFlow/CheckoutFlowContext"
import FormHasValidatedContext from "@components/Inputs/FormHasValidatedContext"

/**
 * Shared component for all steps in the registration flow.
 * Provides a title buttons for navigation
 */

type RegistrationStepProps = React.PropsWithChildren<{
  title?: string
  sidebarContent: React.ReactNode
  contentSpacing?: number
  primaryButtonText: string
  primaryButtonHandler?: ButtonProps["onClick"]
  secondaryButtonText?: string
  secondaryButtonHandler?: ButtonProps["onClick"]
  tertiaryButtonText?: string
  tertiaryButtonHandler?: ButtonProps["onClick"]
}>

// Keeping as props so that we'll have access to setActiveStep before we extract out the props
// so that we can use create a default handler.
export default function RegistrationStep(props: RegistrationStepProps) {
  const { setActiveStep } = React.useContext(CheckoutFlowContext)
  const [formHasValidated, setFormHasValidated] = React.useState(false)
  const { scrollTo } = useScrollTo(config.stiff)
  const {
    title,
    sidebarContent,
    contentSpacing = 3,
    primaryButtonText,
    primaryButtonHandler = () => {
      // Verify all required inputs are filled in
      setFormHasValidated(true)
      const requiredInputs =
        document.querySelectorAll<HTMLInputElement>("[required]")
      const emptyRequired = Array.from(requiredInputs).filter(
        (item) => !item.value || item.attributes.getNamedItem("invalid")
      )
      // For checkbox groups we hack className to include 'checkbox-group-empty' if its required and empty.
      const requiredCheckboxesIsEmpty = Array.from(
        document.querySelectorAll<HTMLDivElement>("[id^='checkbox-group']")
      ).filter((e) => e.className.includes("checkbox-group-empty"))

      // For radio groups we hack className to include 'radio-group-empty' if its required and empty.
      const requiredRadioGroupsIsEmpty = Array.from(
        document.querySelectorAll<HTMLDivElement>("[id^='radio-group']")
      ).filter((e) => e.className.includes("radio-group-empty"))

      if (
        emptyRequired.length > 0 ||
        requiredCheckboxesIsEmpty.length > 0 ||
        requiredRadioGroupsIsEmpty.length > 0
      ) {
        alert("Please fill in all required fields.")
        return
      }

      // Otherwise, we've filled in all required fields so continue
      setActiveStep((currentStep) => currentStep + 1)
      setFormHasValidated(false)
      scrollTo(0)
    },

    secondaryButtonText,
    secondaryButtonHandler = () => {
      setActiveStep((currentStep) => currentStep - 1)
      scrollTo(0)
    },

    tertiaryButtonText,
    tertiaryButtonHandler = () => {
      setActiveStep((currentStep) => currentStep - 1)
      scrollTo(0)
    },
    children,
  } = props

  // Using the props version here that doesn't have the default handlers assigned
  const isPrimaryActionNavigation = props.primaryButtonHandler === undefined
  const isSecondaryActionNavigation = props.secondaryButtonHandler === undefined
  const isTertiaryActionNavigation = props.tertiaryButtonHandler === undefined

  return (
    <FormHasValidatedContext.Provider value={formHasValidated}>
      <Grid
        container
        // sx={{ padding: { xs: 1, lg: 4 } }}
      >
        {/* Title */}
        {title && (
          <Grid size={12} sx={{ paddingLeft: { xs: 0, sm: 1, md: 3 } }}>
            <Typography variant="h2">{title}</Typography>
          </Grid>
        )}

        {/* Main Content */}
        <Grid
          container
          size={{ xs: 12, lg: 8 }}
          spacing={2}
          justifyContent={"flex-end"}
          padding={{
            xs: 0,
            md: 2,
          }}
        >
          <Grid
            container
            size={12}
            spacing={contentSpacing}
            paddingLeft={{
              xs: 1,
              md: 2.5,
            }}
            paddingRight={{
              xs: 1,
              md: 2.5,
            }}
            paddingBottom={{
              xs: 1,
              md: 2.5,
            }}
            paddingTop={{
              xs: 1,
              md: title ? 2.5 : 0,
            }}
          >
            {children}
          </Grid>

          {tertiaryButtonText && (
            <Grid>
              <AnimatedButton
                boopProps={
                  isTertiaryActionNavigation
                    ? { scale: 1.01, x: -3 }
                    : { scale: 1.05 }
                }
                onClick={tertiaryButtonHandler}
                variant="outlined"
                fullWidth
                startIcon={isTertiaryActionNavigation && <ArrowBack />}
              >
                {tertiaryButtonText}
              </AnimatedButton>
            </Grid>
          )}

          {secondaryButtonText && (
            <Grid>
              <AnimatedButton
                boopProps={
                  isSecondaryActionNavigation
                    ? { scale: 1.01, x: -3 }
                    : { scale: 1.05 }
                }
                onClick={secondaryButtonHandler}
                variant="outlined"
                fullWidth
                startIcon={isSecondaryActionNavigation && <ArrowBack />}
              >
                {secondaryButtonText}
              </AnimatedButton>
            </Grid>
          )}

          <Grid sx={{ paddingRight: 2.5 }}>
            <AnimatedButton
              boopProps={
                isPrimaryActionNavigation
                  ? { scale: 1.01, x: 3 }
                  : { scale: 1.05 }
              }
              onClick={primaryButtonHandler}
              variant="contained"
              fullWidth
              sx={{ backgroundColor: "primary.dark", color: "white" }}
              endIcon={isPrimaryActionNavigation && <ArrowForward />}
            >
              {primaryButtonText}
            </AnimatedButton>
          </Grid>
        </Grid>

        {/* Side Graphic */}
        <Grid
          size={3}
          sx={{
            display: { xs: "none", lg: "block" },
            paddingTop: {
              xs: 0,
              md: 2,
            },
          }}
        >
          {sidebarContent}
        </Grid>
      </Grid>
    </FormHasValidatedContext.Provider>
  )
}
