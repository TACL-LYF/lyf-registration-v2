import { PaletteColorOptions } from "@mui/material"

declare module "@mui/material/styles" {
  interface Palette {
    tertiary: Palette["primary"]
    gray: string,
    lightgray: string,
    offwhite: string,
  }

  interface PaletteOptions {
    tertiary: PaletteOptions["primary"]
    gray: string,
    lightgray: string,
    offwhite: string,
  }

  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    xxl: true;
  }
}
