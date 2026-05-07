import * as React from "react"
import {
  collection,
  doc,
  Firestore,
  FirestoreError,
  query,
  QueryConstraint,
  DocumentReference,
  getDoc,
  getDocs,
} from "firebase/firestore"
import { useCollection } from "react-firebase-hooks/firestore"

import {
  AdminRole,
  Camper,
  CamperHealth,
  Demographics,
  Family,
  Parent,
  Registration,
} from "lyf-registration-schemas"

type useRegistrationsProps = {
  isAdmin: boolean
  adminRole: AdminRole | null
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
  Partial<CamperHealth> &
  FamilyData & {
    registrationRef: DocumentReference
    registrationYear: number
    demographics?: Demographics
  }

const parentIndex = (parent: Parent, emails: string[]) => {
  if (!parent.email) {
    return Number.MAX_SAFE_INTEGER
  }

  const index = emails.indexOf(parent.email)
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER
}

function canReadHealth(role: AdminRole | null): boolean {
  return role === "health_staff" || role === "full_admin"
}

function canReadDemographics(role: AdminRole | null): boolean {
  return role === "full_admin"
}

export default function useRegistrations({
  isAdmin,
  adminRole,
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
    isAdmin && adminRole
      ? query<Registration>(
          // @ts-ignore
          collection(firestore, `camps/${campYear}/registrations`),
          ...constraints
        )
      : null
  )

  // Clear caches when role, campYear, or firestore instance changes
  const prevAdminRole = React.useRef(adminRole)
  const prevCampYear = React.useRef(campYear)
  React.useEffect(() => {
    if (
      prevAdminRole.current !== adminRole ||
      prevCampYear.current !== campYear
    ) {
      regDataMap.current = new Map()
      camperDataMap.current = new Map()
      familyDataMap.current = new Map()
      setAllData([])
      prevAdminRole.current = adminRole
      prevCampYear.current = campYear
    }
  }, [adminRole, campYear])

  React.useEffect(() => {
    async function combineData() {
      if (!values) {
        return
      }

      await Promise.all(
        values.docChanges().map(async (docChange) => {
          const registration = docChange.doc
          const data = registration.data()
          const id = registration.id

          // Load base camper document (Tier 0 — all admins)
          let camperData = camperDataMap.current.get(data.camper.id)
          if (!camperData) {
            const camper = await getDoc<Camper>(data.camper)
            camperData = camper.exists() ? camper.data() : {}
            if (!camper.exists()) {
              console.error("No camper found.")
            }
            camperDataMap.current.set(data.camper.id, camperData)
          }

          // Load private health sub-doc (Tier 1 — health_staff, full_admin)
          let healthData: Partial<CamperHealth> = {}
          if (canReadHealth(adminRole)) {
            try {
              const healthDoc = await getDoc(
                doc(firestore, `${data.camper.path}/private/health`)
              )
              if (healthDoc.exists()) {
                healthData = healthDoc.data() as CamperHealth
              }
            } catch {
              // Permission denied or doc doesn't exist — leave empty
            }
          }

          // Load private demographics sub-doc (Tier 2 — full_admin only)
          let demographicsData: Demographics | undefined
          if (canReadDemographics(adminRole)) {
            try {
              const demoDoc = await getDoc(
                doc(firestore, `${data.camper.path}/private/demographics`)
              )
              if (demoDoc.exists()) {
                demographicsData = demoDoc.data() as Demographics
              }
            } catch {
              // Permission denied or doc doesn't exist — leave empty
            }
          }

          // Load family and parents (Tier 0 — all admins)
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
            ...healthData,
            ...data,
            ...familyData,
            ...(demographicsData ? { demographics: demographicsData } : {}),
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
  }, [values, adminRole, campYear, firestore])

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
