import React from "react"

import { useInView, animated, SpringConfig, config } from "@react-spring/web"

type FadeInProps = React.PropsWithChildren<{
  translateX?: number
  translateY?: number
  opacity?: number
  delay?: number
  repeatEveryView?: boolean
  springConfig?: SpringConfig
}>

export default function FadeIn({
  translateX = 0,
  translateY = 0,
  opacity = 0,
  delay = 0,
  repeatEveryView = false,
  springConfig = config.slow,
  children,
}: FadeInProps) {
  const [ref, springs] = useInView(() => ({
    from: {
      translateX,
      translateY,
      opacity,
      width: "100%",
    },
    to: {
      translateX: 0,
      translateY: 0,
      opacity: 1,
      width: "100%",
    },
    delay: delay,
    config: springConfig,
  }), {
    once: !repeatEveryView,
    // Turn this on when developing so you're not constantly refreshing the page.
    // once: false,
  })

  return (
    <animated.div ref={ref} style={springs}>
      {children}
    </animated.div>
  )
}
