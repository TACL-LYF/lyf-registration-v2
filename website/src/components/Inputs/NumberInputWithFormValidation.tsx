import React from "react"
import { NumberInputProps } from "@mui/base"
import NumberInput from "./NumberInput"
import FormHasValidatedContext from "./FormHasValidatedContext"

export default function NumberInputWithFormValidation({
    required,
    error,
    value,
    ...props
}: NumberInputProps) {
    const formHasValidated = React.useContext(FormHasValidatedContext)
    const [hasFocused, setHasFocused] = React.useState(false)
    const formValidationError =
      required && (formHasValidated || hasFocused) && !value

    return (
      <NumberInput
        required={required}
        error={error || formValidationError}
        value={value}
        onBlur={() => setHasFocused(true)}
        {...props}
      />
    )
}
