/**
 * Our component that handles globals and provides theme to the entire website.
 *
 * Used in wrapRootElement in gatsby-browser.ts and gatsby-ssr.ts
 * See: https://www.gatsbyjs.com/docs/browser-apis/
 */

import React, { useEffect } from "react"
import { Globals } from "@react-spring/web"
import { ThemeProvider } from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"

// Components
import theme from "./theme"
import AuthContext from "@components/Auth/AuthContext"
import ProdContext from "@components/ProdContext/ProdContext"

// Hooks
import usePrefersReducedMotion from "@hooks/usePrefersReducedMotion"
import useFirebaseAuth from "@hooks/useFirebaseAuth"
import useProduction from "@hooks/useProduction"

type Props = React.PropsWithChildren

export default function Providers({ children }: Props) {
  // If the user has "prefers reduced motion" on, then we want to respect
  // that setting and disable our animations.
  const prefersReducedMotion = usePrefersReducedMotion()
  useEffect(
    () => Globals.assign({ skipAnimation: prefersReducedMotion }),
    [prefersReducedMotion]
  )

  const auth = useFirebaseAuth()
  const prodContext = useProduction()

  // Provide a custom theme for this app
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthContext.Provider value={auth}>
          <ProdContext.Provider value={prodContext}>
            {children}
          </ProdContext.Provider>
        </AuthContext.Provider>
      </LocalizationProvider>
    </ThemeProvider>
  )
}
