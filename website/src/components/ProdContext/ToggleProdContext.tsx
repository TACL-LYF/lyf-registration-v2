import React from "react"
import { FormControlLabel, FormGroup, Switch } from "@mui/material"

import ProdContext from "@components/ProdContext"

type ToggleProdContextProps = {
  label: string
}

export default function ToggleProdContext({ label }: ToggleProdContextProps) {
  const { isProd, setIsProd } = React.useContext(ProdContext)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setIsProd(!event.target.checked)
  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch checked={!isProd} onChange={handleChange} />}
        label={label}
      />
    </FormGroup>
  )
}
