import React from "react"
import { Typography, TypographyProps } from "@mui/material"

type GradientTypographyProps = Omit<TypographyProps, "color">

export default function GradientTypography({
  sx,
  ...rest
}: GradientTypographyProps) {
  return (
    <Typography
      sx={{
        color: "transparent",
        backgroundClip: "text",
        // Gradient created from https://www.joshwcomeau.com/gradient-generator/
        backgroundImage: `linear-gradient(
          50deg,
          hsl(178deg 59% 40%) 0%,
          hsl(191deg 100% 38%) 16%,
          hsl(203deg 71% 51%) 29%,
          hsl(242deg 55% 69%) 39%,
          hsl(308deg 46% 60%) 49%,
          hsl(342deg 77% 63%) 57%,
          hsl(357deg 89% 71%) 66%,
          hsl(12deg 99% 73%) 74%,
          hsl(23deg 100% 75%) 82%,
          hsl(33deg 100% 78%) 90%,
          hsl(43deg 100% 83%) 100%
        );`,
      }}
      {...rest}
    />
  )
}
