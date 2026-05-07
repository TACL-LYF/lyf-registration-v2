import React from "react"
import { Card, CardProps, useTheme } from "@mui/material"

type CardWithShadowProps = CardProps & {
  shadowColor: "primary" | "secondary" | "tertiary"
}

export default function CardWithShadow({
  shadowColor,
  sx,
  ...props
}: CardWithShadowProps) {
  const theme = useTheme()
  const shadowColorStyle = theme.palette[shadowColor].main

  return (
    <Card
      {...props}
      sx={{
        ...sx,
        borderRadius: 4,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: shadowColorStyle,
        boxShadow: `6px 6px 0px ${shadowColorStyle}`,
      }}
    ></Card>
  )
}
