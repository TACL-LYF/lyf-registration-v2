import * as React from "react"
import { Box, Button, Card, CardHeader, Stack } from "@mui/material"
import {
  GridColDef,
  GridRowModel,
  GridSlotProps,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridRowSelectionModel,
} from "@mui/x-data-grid"
import { getDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import dayjs from "dayjs"

import {
  RegistrationData,
  getParentNames,
  getParentEmails,
  getParentPhoneNumbers,
} from "@hooks/useRegistrations"
import { Table, DataGridColumnAlign } from "@components/Table"
import { AdminRole, RegistrationStatus } from "lyf-registration-schemas"

// Utils
import { Payment } from "@utils/databaseSchema"

import CancelStatusDialog, {
  CancelStatusPromise,
  RowWithStatusAndNotes,
} from "./CancelStatusDialog"
import useFilterRegistrationStatus from "@hooks/useFilterRegistrationStatus"

import CopyToClipboardButton from "./CopyToClipboardButton"
import RefundDialog from "@components/Dialog/RefundDialog"

type RegistrationDashboardProps = {
  data: RegistrationData[]
  loading: boolean
  campYear: number
  adminRole: AdminRole | null
}

export interface RegDashboardRow extends RowWithStatusAndNotes {
  name: string
  preferredName: string
  grade: number
  status: string
  gender: string
  pronouns: string
  shirtSize: string
  medicalConditions: string
  dietAndFoodAllergies: string
  isPreRegistered: boolean
  isReturning: boolean
  parentNames: string
  parentEmails: string
  createdAt: Date
  internalNotes: string
}

const HEALTH_FIELDS = new Set(["medicalConditions", "dietAndFoodAllergies"])

const allColumns: GridColDef[] = [
  {
    field: "name",
    headerName: "Name",
    minWidth: 130,
    flex: 0.25,
    ...DataGridColumnAlign,
  },
  {
    field: "preferredName",
    headerName: "Preferred Name",
    flex: 0.25,
    ...DataGridColumnAlign,
  },
  {
    field: "grade",
    headerName: "Grade",
    type: "number",
    width: 75,
    ...DataGridColumnAlign,
  },
  {
    field: "birthDate",
    headerName: "Birthday",
    type: "date",
    width: 100,
    ...DataGridColumnAlign,
  },
  {
    field: "status",
    headerName: "Status",
    width: 100,
    type: "singleSelect",
    editable: true,
    valueOptions: Object.values(RegistrationStatus),
    ...DataGridColumnAlign,
  },
  {
    field: "gender",
    headerName: "Gender",
    width: 100,
    ...DataGridColumnAlign,
  },
  {
    field: "pronouns",
    headerName: "Pronouns",
    width: 100,
    ...DataGridColumnAlign,
  },
  {
    field: "shirtSize",
    headerName: "Shirt Size",
    width: 75,
    ...DataGridColumnAlign,
  },
  {
    field: "medicalConditions",
    headerName: "Medical Conditions",
    type: "string",
    minWidth: 150,
    flex: 0.25,
    ...DataGridColumnAlign,
  },
  {
    field: "dietAndFoodAllergies",
    headerName: "Diet and Food Allergies",
    type: "string",
    minWidth: 150,
    maxWidth: 175,
    flex: 0.25,
    ...DataGridColumnAlign,
  },
  {
    field: "cabinPreference",
    headerName: "Cabin Preference",
    type: "string",
    minWidth: 150,
    flex: 0.25,
    ...DataGridColumnAlign,
  },
  {
    field: "isPreRegistered",
    headerName: "Pre-Registered",
    type: "boolean",
    width: 20,
    ...DataGridColumnAlign,
  },
  {
    field: "isReturning",
    headerName: "Returning Camper",
    type: "boolean",
    width: 20,
    ...DataGridColumnAlign,
  },
  {
    field: "parentNames",
    headerName: "Parent Names",
    type: "string",
    minWidth: 150,
    flex: 0.25,
    ...DataGridColumnAlign,
  },
  {
    field: "parentEmails",
    headerName: "Parent Emails",
    type: "string",
    minWidth: 150,
    flex: 1,
    ...DataGridColumnAlign,
  },
  {
    field: "parentPhoneNumbers",
    headerName: "Parent Phone Numbers",
    type: "string",
    minWidth: 150,
    flex: 1,
    ...DataGridColumnAlign,
  },
  {
    field: "createdAt",
    headerName: "Created At",
    type: "dateTime",
    width: 175,
    ...DataGridColumnAlign,
  },
  {
    field: "internalNotes",
    headerName: "Notes",
    editable: true,
    flex: 1,
    headerAlign: "center",
  },
]

function getColumnsForRole(role: AdminRole | null): GridColDef[] {
  const canSeeHealth = role === "health_staff" || role === "full_admin"
  if (canSeeHealth) return allColumns
  return allColumns.filter((col) => !HEALTH_FIELDS.has(col.field))
}

export default function RegistrationDashboard({
  data,
  loading,
  campYear,
  adminRole,
}: RegistrationDashboardProps) {
  const columns = React.useMemo(() => getColumnsForRole(adminRole), [adminRole])
  const [filteredData, selectComponent] = useFilterRegistrationStatus(data, [
    RegistrationStatus.ACTIVE,
  ])
  const registrationData = filteredData.sort((a, b) =>
    a.status.localeCompare(b.status)
  )

  const [rowSelection, setRowSelection] = React.useState<GridRowSelectionModel>(
    []
  )
  const [refundDialogOpen, setRefundDialogOpen] = React.useState<boolean>(false)
  const [refundPayments, setRefundPayments] = React.useState<
    Map<RegistrationData, Payment[]>
  >(new Map())
  const [cancelPromiseContext, setCancelPromiseContext] =
    React.useState<CancelStatusPromise | null>(null)

  const rows: RegDashboardRow[] = registrationData.map((reg, index) => ({
    id: index.toString(),
    index: index + 1,
    name: reg.camperName,
    preferredName: reg.preferredName || "",
    grade: reg.grade,
    status: reg.status,
    birthDate: dayjs(reg.birthDate ?? "").toDate(),
    isPreRegistered: reg.isPreRegistered,
    gender: reg.gender?.join(", ") || "",
    pronouns: reg.pronouns || "",
    shirtSize: reg.shirtSize || "",
    medicalConditions: reg.medicalConditions || "",
    dietAndFoodAllergies: reg.dietAndFoodAllergies || "",
    cabinPreference: reg.cabinPreference || "",
    isReturning: !!reg.isReturning,

    // Join the parent's names if they exist.
    parentNames: getParentNames(reg),
    // Join the parent's emails if they exist.
    parentEmails: getParentEmails(reg),
    // Join the parent's phone numbers if they exist.
    parentPhoneNumbers: getParentPhoneNumbers(reg),

    internalNotes: reg.internalNotes,
    createdAt: reg.createdAt.toDate(),
  }))

  const updateRow = async (newRow: RegDashboardRow) => {
    const registrationRef = registrationData[newRow.index - 1].registrationRef
    await updateDoc(registrationRef, {
      status: newRow.status,
      internalNotes: newRow.internalNotes ?? null,
      updatedAt: serverTimestamp(),
    })
  }

  const copyEmails = () => {
    const parentEmails = new Set<string>()
    // Each row has parent emails already joined together, so we need to split them back out.
    rows.forEach((r) =>
      r.parentEmails.split(", ").forEach((email) => parentEmails.add(email))
    )

    return Array.from(parentEmails.values()).join("\n")
  }

  const copyParentContactInfo = () => {
    const parentContactInfo = new Set<string>()
    registrationData.forEach((reg) => {
      reg.parents.forEach((p) => {
        const { email, firstName, lastName } = p

        // If there's no email then no need to add an entry.
        if (!email) {
          return
        }

        // Email, First Name, Last Name all tab separated
        parentContactInfo.add(
          [email, firstName ?? "", lastName ?? ""].join("\t")
        )
      })
    })

    return Array.from(parentContactInfo.values()).join("\n")
  }

  const updateRowPromise = async (
    newRow: GridRowModel<RegDashboardRow>,
    oldRow: GridRowModel<RegDashboardRow>
  ) =>
    new Promise<RegDashboardRow>((resolve, reject) => {
      if (
        newRow.status === oldRow.status &&
        newRow.internalNotes === oldRow.internalNotes
      ) {
        // Nothing changed so just resolve
        resolve(newRow)
        return
      }

      if (newRow.status === RegistrationStatus.CANCELLED) {
        setCancelPromiseContext({
          newRow,
          oldRow,
          resolve,
          reject,
        })
      } else {
        updateRow(newRow)
          .then(() => resolve(newRow))
          .catch((e) => reject(new Error(`Failed to update row.: ${e}`)))
      }
    })

  const toolbar = (props: GridSlotProps["toolbar"]) => {
    const { rowSelection } = props

    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
        <Box sx={{ flexGrow: 1 }} />
        {adminRole === "full_admin" && (
          <Button
            onClick={async () => {
              const paymentMap: [RegistrationData, Payment[]][] =
                await Promise.all(
                  rowSelection.map(async (rowId) => {
                    const registration = registrationData[rows[rowId].index - 1]
                    const payments = await Promise.all(
                      !registration.payments
                        ? []
                        : registration.payments.map(async (p) => ({
                            ...(await getDoc(p)).data(),
                            ref: p,
                            id: p.id,
                          }))
                    )
                    return [registration, payments]
                  })
                )
              setRefundPayments(new Map(paymentMap))
              setRefundDialogOpen(true)
            }}
            onMouseDown={(e: React.MouseEvent) => {
              // Prevents moving focus away from other elements
              e.preventDefault()
            }}
            disabled={rowSelection.length === 0}
            variant="outlined"
          >
            Refund
          </Button>
        )}
      </GridToolbarContainer>
    )
  }

  return (
    <>
      <Card>
        <CardHeader
          title={`${campYear} LYF Camp Registrations`}
          titleTypographyProps={{
            align: "center",
            variant: "h4",
          }}
        />
        <RefundDialog
          refundPayments={refundPayments}
          open={refundDialogOpen}
          setOpen={(b) => setRefundDialogOpen(b)}
        ></RefundDialog>
        {selectComponent}
        <Stack direction="row" sx={{ padding: 1 }} spacing={2}>
          <CopyToClipboardButton processDataFunc={copyEmails}>
            Copy Parent Emails to Clipboard
          </CopyToClipboardButton>
          <CopyToClipboardButton processDataFunc={copyParentContactInfo}>
            Copy Parent Contact Info to Clipboard
          </CopyToClipboardButton>
        </Stack>
        <Table
          rows={rows}
          columns={columns}
          loading={loading}
          pageSize={100}
          updateRow={updateRowPromise}
          hiddenColumns={["createdAt", "isReturning"]}
          toolbar={toolbar}
          rowSelectionModel={rowSelection}
          setRowSelectionModel={setRowSelection}
        />
      </Card>
      <CancelStatusDialog
        context={cancelPromiseContext}
        setContext={setCancelPromiseContext}
        updateRow={updateRow}
      />
    </>
  )
}
