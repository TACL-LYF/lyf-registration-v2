import { createContext } from "react"
import { AlertProps } from "@mui/material"

export type SnackbarAlertType = Pick<AlertProps, "children" | "severity"> | null

type SnackbarContextType = {
  snackbar: SnackbarAlertType,
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarAlertType>>
}

const SnackbarAlertContext = createContext<SnackbarContextType>({
  snackbar: null,
  setSnackbar: () => {}
})

export default SnackbarAlertContext