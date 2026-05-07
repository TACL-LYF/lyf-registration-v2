import React from "react"
import { FormLabel, Stack, TextField, TextFieldProps } from "@mui/material"
import FormHasValidatedContext from "./FormHasValidatedContext"

type TextFieldWithFormValidationProps = TextFieldProps & {
  formLabel?: React.ReactNode
}

export default function TextFieldWithFormValidation({
  required,
  error,
  value,
  formLabel,
  ...props
}: TextFieldWithFormValidationProps) {
  const formHasValidated = React.useContext(FormHasValidatedContext)
  const [hasFocused, setHasFocused] = React.useState(false)
  const formValidationError =
    required && (formHasValidated || hasFocused) && !value

  return (
    <Stack spacing={2}>
      <FormLabel>{formLabel}</FormLabel>
      <TextField
        required={required}
        error={error || formValidationError}
        value={value ?? ""}
        onBlur={() => setHasFocused(true)}
        {...props}
      />
    </Stack>
  )
}
