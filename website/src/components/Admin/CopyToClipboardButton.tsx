import React from "react"
import { Button } from "@mui/material"
import { Check, CopyAll } from "@mui/icons-material"

import { SnackbarAlertContext } from "@components/SnackbarAlert"

type CopyToClipboardButtonProps = React.PropsWithChildren<{
  processDataFunc: () => string
}>

export default function CopyToClipboardButton({
  processDataFunc,
  children,
}: CopyToClipboardButtonProps) {
  const [isCopied, setIsCopied] = React.useState(false)
  const { setSnackbar } = React.useContext(SnackbarAlertContext)

  const copyToClipboard = () => {
    const data = processDataFunc()

    navigator.clipboard.writeText(data)
    setSnackbar({
      children: "Successfully copied to clipboard",
      severity: "success",
    })
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Button
      onClick={copyToClipboard}
      variant="contained"
      startIcon={isCopied ? <Check /> : <CopyAll />}
    >
      {children}
    </Button>
  )
}
