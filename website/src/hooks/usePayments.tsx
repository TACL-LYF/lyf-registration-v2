import {
  collection,
  Firestore,
  FirestoreError,
  query,
} from "firebase/firestore"
import { useCollection } from "react-firebase-hooks/firestore"

import { Payment } from "@utils/databaseSchema"

type UsePaymentsProps = {
  isAdmin: boolean
  firestore: Firestore
}

export default function usePayments({
  isAdmin,
  firestore,
}: UsePaymentsProps): [Payment[], boolean, FirestoreError | undefined] {
  const [values, loading, error] = useCollection<Payment>(
    isAdmin
      ? query<Payment>(
          // @ts-ignore
          collection(firestore, "payments")
        )
      : null
  )

  const data: Payment[] =
    values?.docs.map((payment) => {
      return { ...payment.data(), ref: payment.ref, id: payment.id }
    }) ?? []

  return [data, loading, error]
}
