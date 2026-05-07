import React, { createContext } from "react"

type CheckoutFlowContextType = {
  activeStep: number,
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
}

const CheckoutFlowContext = createContext<CheckoutFlowContextType>({
  activeStep: 0,
  setActiveStep: () => null
})

export default CheckoutFlowContext
