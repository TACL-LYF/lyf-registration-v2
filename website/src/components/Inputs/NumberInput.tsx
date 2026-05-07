import React from "react"
import {
  Unstable_NumberInput as BaseNumberInput,
  NumberInputProps,
  numberInputClasses,
} from "@mui/base/Unstable_NumberInput"

import { styled } from "@mui/system"

const CustomNumberInput = React.forwardRef(function CustomNumberInput(
  props: NumberInputProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  return (
    <BaseNumberInput
      slots={{
        root: StyledInputRoot,
        input: StyledInputElement,
        incrementButton: StyledButton,
        decrementButton: StyledButton,
      }}
      slotProps={{
        incrementButton: {
          children: "▴",
        },
        decrementButton: {
          children: "▾",
        },
      }}
      {...props}
      ref={ref}
    />
  )
})

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
}

const StyledInputRoot = styled("div")(
  ({ theme }) => `
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 400;
    border-radius: ${theme.shape.borderRadius}px;
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
    background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
    border: 1px solid rgba(0, 0, 0, 0.25);
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 19px;
    grid-template-rows: 1fr 1fr;
    overflow: hidden;
    column-gap: 8px;
    padding: ${theme.spacing(0.5)};

    &:hover {
        border-color: black;
      }

    &.${numberInputClasses.error} {
        border-color: ${theme.palette.error.main};
    }

    &.${numberInputClasses.focused} {
      border-color: ${theme.palette.primary.main};
      box-shadow: 0 0 0 1px ${theme.palette.primary.main};
    }

    // firefox
    &:focus-visible {
      outline: 0;
    }
  `
)

const StyledInputElement = styled("input")(
  ({ theme }) => `
    font-size: 0.875rem;
    font-family: inherit;
    font-weight: 400;
    line-height: 1.5;
    grid-column: 1/2;
    grid-row: 1/3;
    width: 100%;
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
    background: inherit;
    border: none;
    border-radius: inherit;
    padding: 8px 12px;
    outline: 0;
  `
)

const StyledButton = styled("button")(
  ({ theme }) => `
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    appearance: none;
    padding: 0;
    width: 19px;
    height: 19px;
    font-family: system-ui, sans-serif;
    font-size: 0.875rem;
    line-height: 1;
    box-sizing: border-box;
    background: ${theme.palette.primary.main};
    border: 0;
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 120ms;

    &:hover {
      background: ${theme.palette.mode === "dark" ? grey[800] : grey[50]};
      border-color: ${theme.palette.primary.main};
      cursor: pointer;
    }

    &.${numberInputClasses.incrementButton} {
      grid-column: 2/3;
      grid-row: 1/2;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border: 1px solid;
      border-bottom: 0;
      border-color: ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
      background: ${theme.palette.mode === "dark" ? grey[900] : grey[50]};
      color: ${theme.palette.mode === "dark" ? grey[200] : grey[900]};

      &:hover {
        cursor: pointer;
        color: #FFF;
        background: ${theme.palette.primary.main};
        border-color: ${theme.palette.primary.main};
      }
    }

    &.${numberInputClasses.decrementButton} {
      grid-column: 2/3;
      grid-row: 2/3;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      border: 1px solid;
      border-color: ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
      background: ${theme.palette.mode === "dark" ? grey[900] : grey[50]};
      color: ${theme.palette.mode === "dark" ? grey[200] : grey[900]};
    }

    &:hover {
      cursor: pointer;
      color: #FFF;
      background: ${theme.palette.primary.main};
      border-color: ${theme.palette.primary.main};
    }

    & .arrow {
      transform: translateY(-1px);
    }

    & .arrow {
      transform: translateY(-1px);
    }
  `
)

export default CustomNumberInput
