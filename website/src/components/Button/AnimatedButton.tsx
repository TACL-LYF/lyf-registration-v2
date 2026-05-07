import React from "react"
import { animated } from "@react-spring/web"
import { Button, ButtonProps } from "@mui/material"

import useBoop, { BoopProps } from "@hooks/useBoop"

const SpringAnimatedButton = animated(Button)

export type AnimatedButtonProps = ButtonProps & {
  boopProps: BoopProps
}

export default function AnimatedButton({
  boopProps,
  disabled,
  ...rest
}: AnimatedButtonProps) {
  const [boopStyles, trigger] = useBoop({ ...boopProps, disabled })

  return (
    <span onMouseEnter={trigger}>
      <SpringAnimatedButton style={boopStyles} disabled={disabled} {...rest} />
    </span>
  )
}
