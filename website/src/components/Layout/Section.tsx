import * as React from "react"
import { Box, Container, ContainerProps } from "@mui/material"

type SectionProps = React.PropsWithChildren<{
  sx?: ContainerProps["sx"]
  maxWidth?: ContainerProps["maxWidth"]
  backgroundColor?: string
}>

export default function Section({
  sx = {},
  maxWidth = "xl",
  backgroundColor,
  children,
}: SectionProps) {
  return (
    <Box
      component={maxWidth ? Container : "div"}
      sx={{
        padding: { xs: 3, md: 10 },
        paddingTop: {xs: 5, md: 10},
        paddingBottom: {xs: 5, md: 10},
        backgroundColor: backgroundColor,
        height: 1,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
