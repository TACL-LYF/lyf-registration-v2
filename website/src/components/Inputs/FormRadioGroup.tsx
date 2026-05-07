import React from "react"
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  RadioGroupProps,
  Stack,
  Tooltip,
} from "@mui/material"
import { Info } from "@mui/icons-material"

import FormHasValidatedContext from "@components/Inputs/FormHasValidatedContext"

type FormRadioGroupProps = RadioGroupProps & {
  disabled?: boolean
  required?: boolean
  options: string[]
  label: string
  tooltip?: string
}

export default function FormRadioGroup({
  id,
  options,
  label,
  tooltip,
  value,
  disabled,
  required = false,
  ...props
}: FormRadioGroupProps) {
  const formHasValidated = React.useContext(FormHasValidatedContext)
  const [hasFocused, setHasFocused] = React.useState(false)
  const formValidationError =
    required && (formHasValidated || hasFocused) && !value

  return (
    <FormControl
      id={`radio-group-${id}`}
      // Hack className to show if a checkbox group is required and empty.
      className={required && !value ? "radio-group-empty" : ""}
      required={required}
      error={formValidationError}
      disabled={disabled}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <FormLabel id={id} error={formValidationError}>
          {label}
        </FormLabel>
        {tooltip && (
          <Tooltip title={tooltip}>
            <Info fontSize="small" />
          </Tooltip>
        )}
      </Stack>
      <RadioGroup
        aria-labelledby={id}
        onBlur={() => setHasFocused(true)}
        value={value ?? ""}
        {...props}
      >
        {options.map((option) => (
          <FormControlLabel
            disabled={disabled}
            value={option}
            key={`${id}-${option}`}
            control={<Radio />}
            label={option}
          />
        ))}
      </RadioGroup>
    </FormControl>
  )
}
