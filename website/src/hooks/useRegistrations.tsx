import * as React from "react"
import {
  collection,
  Firestore,
  FirestoreError,
  query,
  QueryConstraint,
  DocumentReference,
  getDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore"
import { useCollection } from "react-firebase-hooks/firestore"

import { Camper, Family, Parent, Registration } from "lyf-registration-schemas"

type useRegistrationsProps = {
  isAdmin: boolean
  campYear: number
  constraints?: QueryConstraint[]
  firestore: Firestore
}

type FamilyData = {
  parents: Parent[]
  familyId: string
  familyData: Family
}

export type RegistrationData = Registration &
  Partial<Camper> &
  FamilyData & {
    registrationRef: DocumentReference
    registrationYear: number
  }

const parentIndex = (parent: Parent, emails: string[]) => {
  if (!parent.email) {
    return Number.MAX_SAFE_INTEGER
  }

  const index = emails.indexOf(parent.email)
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER
}

export default function useRegistrations({
  isAdmin,
  campYear,
  constraints = [],
  firestore,
}: useRegistrationsProps): [
  RegistrationData[],
  boolean,
  FirestoreError | undefined
] {
  const [allData, setAllData] = React.useState<RegistrationData[]>([])
  const pastFirestore = React.useRef<Firestore>(firestore)
  const shouldUpdate = pastFirestore.current !== firestore
  // If the firestore instance changed, we need to update our maps.
  if (shouldUpdate) {
    pastFirestore.current = firestore
  }

  // @ts-ignore Ignore the fact that we can't set undefined. We have to start out with undefined
  // so that we don't create a new map on every render: https://beta.reactjs.org/reference/react/useRef#avoiding-recreating-the-ref-contents
  const regDataMap = React.useRef<Map<string, RegistrationData>>(undefined)
  if (regDataMap.current === undefined || shouldUpdate) {
    regDataMap.current = new Map()
  }
  // @ts-ignore Same as above
  const camperDataMap = React.useRef<Map<string, Partial<Camper>>>(undefined)
  if (camperDataMap.current === undefined || shouldUpdate) {
    camperDataMap.current = new Map()
  }
  // @ts-ignore Same as above
  const familyDataMap = React.useRef<Map<string, FamilyData>>(undefined)
  if (familyDataMap.current === undefined || shouldUpdate) {
    familyDataMap.current = new Map()
  }

  const [values, loading, error] = useCollection<Registration>(
    isAdmin
      ? query<Registration>(
          // @ts-ignore
          collection(firestore, `camps/${campYear}/registrations`),
          ...constraints
        )
      : null
  )

  React.useEffect(() => {
    async function combineData() {
      if (!values) {
        return
      }

      // Go through all docs that changed and update the map.
      await Promise.all(
        values.docChanges().map(async (docChange) => {
          // Could eventually use oldIndex and newIndex maybe but for now
          // we'll just rely on this.
          const registration = docChange.doc
          const data = registration.data()
          const id = registration.id

          // Add the camper document data.
          let camperData = camperDataMap.current.get(data.camper.id)
          if (!camperData) {
            const camper = await getDoc<Camper>(data.camper)
            camperData = camper.exists() ? camper.data() : {}
            if (!camper.exists()) {
              console.error("No camper found.")
            }

            camperDataMap.current.set(data.camper.id, camperData)
          }

          // Go through all of the parents listed in the family and add them to the object.
          // Assume we can always find the camper for now. We'll have to add proper error handling later.
          const family = data.camper.parent.parent as DocumentReference<Family>
          const familyId = family.id as string
          let familyData: FamilyData | undefined =
            familyDataMap.current.get(familyId)
          if (!familyData) {
            const fam = await getDoc<Family>(family)
            const emails = fam.data()?.emails

            const parentsCollection = collection(
              firestore,
              `/families/${familyId}/parents`
            )
            const parents = await getDocs<Parent>(query(parentsCollection))
            let parentsData = parents.docs.map((p) => p.data())

            if (emails) {
              parentsData = parentsData.sort(
                (a, b) => parentIndex(a, emails) - parentIndex(b, emails)
              )
            }

            familyData = {
              parents: parentsData,
              familyId: familyId,
              familyData: fam.data(),
            }
            familyDataMap.current.set(familyId, familyData)
          }

          regDataMap.current.set(id, {
            registrationRef: registration.ref,
            registrationYear: campYear,
            ...camperData,
            ...data,
            ...familyData,
          })
        })
      )
      setAllData(
        Array.from(regDataMap.current?.values()).filter(
          (reg) => reg.registrationYear === campYear
        )
      )
    }
    combineData()
  }, [values])

  return [allData, loading, error]
}

/**
 * Get all the parent names if they exist on the parent and filter them out otherwise
 * @param reg
 * @returns
 */
export const getParentNames = (reg: RegistrationData) =>
  reg.parents
    .map((p) =>
      !!p.firstName && !!p.lastName ? `${p.firstName} ${p.lastName}` : undefined
    )
    .filter((name) => !!name)
    .join(",\n")

/**
 * Get all the parent emails if they're not null.
 * @param reg
 * @returns
 * @param reg
 * @returns
 */
export const getParentEmails = (reg: RegistrationData) =>
  reg.parents
    .map((p) => p.email)
    .filter((email) => !!email)
    .join(", ")

/**
 * Get all the parent emails if they're not null.
 * @param reg
 * @returns
 * @param reg
 * @returns
 */
export const getParentPhoneNumbers = (reg: RegistrationData) =>
  reg.parents
    .map((p) => p.phoneNumber)
    .filter((phoneNumber) => !!phoneNumber)
    .join(", ")
