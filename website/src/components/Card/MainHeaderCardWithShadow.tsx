import React from "react"
import { CardHeader, CardProps, useTheme } from "@mui/material"

import CardWithShadow from "./CardWithShadow"

type MainHeaderCardWithShadowProps = CardProps & {
  title: string
  mainColor: "primary" | "secondary" | "tertiary"
}

export default function MainHeaderCardWithShadow({
  title,
  mainColor,
  children,
  ...props
}: MainHeaderCardWithShadowProps) {
  const theme = useTheme()

  return (
    <CardWithShadow shadowColor={mainColor} {...props} sx={{
      height: 1,
    }}>
      <CardHeader
        title={title}
        titleTypographyProps={{
          variant: "h4",
          textAlign: "center",
        }}
        sx={{
          padding: 3,
          backgroundColor: theme.palette[mainColor].main,
          color: theme.palette[mainColor].contrastText,
        }}
      ></CardHeader>
      {children}
    </CardWithShadow>
  )
}
