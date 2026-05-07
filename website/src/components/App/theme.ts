import {
  createTheme,
  PaletteColorOptions,
  responsiveFontSizes,
} from "@mui/material"

export const TEAL: PaletteColorOptions = {
  main: "#29A19D",
  light: "#A2E8E5",
  dark: "#046A67",
  contrastText: "#FFFFFF",
}

export const SAFFRON_YELLOW: PaletteColorOptions = {
  main: "#FFCA43",
  light: "#FFE6A7",
  dark: "#D09600",
}

export const PINK: PaletteColorOptions = {
  main: "#E95984",
  light: "#FFC3DA",
  dark: "#DA0758",
  contrastText: "#FFFFFF",
}

const bodyFontFamily = {
  fontFamily: "Arial, sans-serif",
  lineHeight: "24px",
}

const theme = createTheme({
  palette: {
    primary: TEAL,
    secondary: PINK,
    tertiary: SAFFRON_YELLOW,
    gray: "#514B4D",
    lightgray: "#DCD2D5",
    offwhite: "#F8F2F4",
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: '"Nunito", Arial, -apple-system, sans-serif',
    h1: {
      fontWeight: 800,
    },
    h2: {
      fontWeight: 800,
    },
    h3: {
      fontWeight: 800,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    subtitle1: { letterSpacing: "0.15px", ...bodyFontFamily },
    subtitle2: { letterSpacing: "0.1px", ...bodyFontFamily },
    body1: { letterSpacing: "0.15px", ...bodyFontFamily },
    body2: { letterSpacing: "0.15px", ...bodyFontFamily },
    button: {
      textTransform: "capitalize",
      fontWeight: 700,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      xxl: 2000,
    }
  }
})

export default responsiveFontSizes(theme)
