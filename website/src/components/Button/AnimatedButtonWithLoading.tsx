import React from "react"

import { CircularProgress } from "@mui/material"

import AnimatedButton, { AnimatedButtonProps } from "./AnimatedButton"

type AnimatedButtonWithLoadingProps = Omit<
  AnimatedButtonProps,
  "onClick" | "startIcon"
> & {
  asyncOnClick: () => Promise<void>
}

export default function AnimatedButtonWithLoading({
  asyncOnClick,
  ...rest
}: AnimatedButtonWithLoadingProps) {
  const [loading, setLoading] = React.useState(false)

  const handleContinue = React.useCallback(() => {
    setLoading(true)
    asyncOnClick().finally(() => setLoading(false))
  }, [asyncOnClick])

  return (
    <AnimatedButton
      {...rest}
      onClick={handleContinue}
      startIcon={loading && <CircularProgress size={20} color="inherit" />}
    />
  )
}
