import { createContext } from "react"

import { ProdContextType } from "@hooks/useProduction"
import { prodFirestore } from "@utils/firebaseApp"
import { getStripeProd } from "@utils/stripe"

const ProdContext = createContext<ProdContextType>({
  isProd: true,
  isTestData: false,
  setIsProd: () => {},
  firestore: prodFirestore,
  getStripe: getStripeProd,
})

export default ProdContext
