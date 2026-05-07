import React from "react"
import { animated } from "@react-spring/web"
import { IconButton, ButtonProps } from "@mui/material"

import useBoop, { BoopProps } from "@hooks/useBoop"

const SpringAnimatedButton = animated(IconButton)

type Props = ButtonProps & {
  boopProps: BoopProps
}

export default function AnimatedIconButton({
  boopProps,
  disabled,
  ...rest
}: Props) {
  const [boopStyles, trigger] = useBoop({ ...boopProps, disabled })

  return (
    <span onMouseEnter={trigger}>
      <SpringAnimatedButton style={boopStyles} disabled={disabled} {...rest} />
    </span>
  )
}
