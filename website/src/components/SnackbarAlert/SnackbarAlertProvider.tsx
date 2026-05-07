import React from "react"

import {
  SnackbarAlertType,
  SnackbarAlertContext,
  SnackbarAlert,
} from "@components/SnackbarAlert"

type SnackbarAlertProviderProps = {
  children: React.ReactNode | React.ReactNode[]
}

export default function SnackbarAlertProvider({children}: SnackbarAlertProviderProps) {
  const [snackbar, setSnackbar] = React.useState<SnackbarAlertType>(null)
  const providerValue = {
    snackbar: snackbar,
    setSnackbar: setSnackbar
  }

  return (
    <SnackbarAlertContext.Provider value={providerValue}>
      {children}
      <SnackbarAlert />
    </SnackbarAlertContext.Provider>
  )
}