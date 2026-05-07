import {
  collection,
  Firestore,
  FirestoreError,
  query,
} from "firebase/firestore"
import { useCollection } from "react-firebase-hooks/firestore"

import { AdminRole } from "lyf-registration-schemas"
import { Payment } from "@utils/databaseSchema"

type UsePaymentsProps = {
  isAdmin: boolean
  adminRole: AdminRole | null
  firestore: Firestore
}

export default function usePayments({
  isAdmin,
  adminRole,
  firestore,
}: UsePaymentsProps): [Payment[], boolean, FirestoreError | undefined] {
  const canReadPayments = isAdmin && adminRole === "full_admin"
  const [values, loading, error] = useCollection<Payment>(
    canReadPayments
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
