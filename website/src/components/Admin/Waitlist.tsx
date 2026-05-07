import * as React from "react"
import {
  GridColDef,
  GridRowModel,
  GridRenderCellParams,
} from "@mui/x-data-grid"
import { Button, Card, CardHeader, Stack } from "@mui/material"
import { serverTimestamp, updateDoc } from "firebase/firestore"

import ConfirmMoveOffWaitlistDialog, {
  MoveOffWaitlistContext,
} from "./ConfirmMoveOffWaitlistDialog"
import {
  RegistrationData,
  getParentNames,
  getParentEmails,
} from "@hooks/useRegistrations"
import { Family, RegistrationStatus } from "lyf-registration-schemas"
import { Table, TableValidRow, DataGridColumnAlign } from "@components/Table"
import { SnackbarAlertContext } from "@components/SnackbarAlert"

type WaitlistProps = {
  data: RegistrationData[]
  loading: boolean
  campYear: number
}

interface WaitlistRow extends TableValidRow {
  id: string
  index: number
  name: string
  campTrack: string
  grade: number
  waitlistTime: Date
  internalNotes: string
  parentNames: string
  parentEmails: string
}

export default function Waitlist({ data, loading, campYear }: WaitlistProps) {
  const waitlist = data
    .filter((reg) => reg.status === RegistrationStatus.WAITLIST)
    .sort(
      (a, b) => (a.waitlistTime?.seconds ?? 0) - (b.waitlistTime?.seconds ?? 0)
    )

  // Handle updating the alert at the bottom of the page.

  const { setSnackbar } = React.useContext(SnackbarAlertContext)

  const updateRow = async (newRow: GridRowModel<WaitlistRow>) => {
    // Grab the firestore document and update the registration document.
    const registrationRef = waitlist[newRow.index - 1].registrationRef
    await updateDoc(registrationRef, {
      internalNotes: newRow.internalNotes,
      updatedAt: serverTimestamp(),
    })
  }

  // We handle moving off the waitlist with one shared function so that we have access to the waitlist data.
  const [moveOffWaitlistContext, setMoveOffWaitlistContext] =
    React.useState<MoveOffWaitlistContext | null>(null)
  const handleMoveOffWaitlist = (index: number) => () => {
    const clickedRegistration = waitlist[index - 1]

    const parents = clickedRegistration.parents
      .filter((p) => p.email && p.email != "")
      .map((p) => ({
        name: `${p.firstName} ${p.lastName}`,
        email: p.email,
      }))

    if (parents.length === 0) {
      setSnackbar({
        children: "No email found for the parents",
        severity: "error",
      })
      return
    }

    // Set the waitlist context so we can show the confirmation prompt.
    setMoveOffWaitlistContext({
      parents: parents,
      campYear: campYear,
      camperName: clickedRegistration.camperName,
      registrationId: clickedRegistration.registrationRef.id,
      campTrack: clickedRegistration.campTrack,
    })
  }

  const MoveOffWaitlistButton = (params: GridRenderCellParams) => (
    <Button onClick={handleMoveOffWaitlist(params.row.index)}>
      Move Off Waitlist
    </Button>
  )

  const addressValueFormatter = (value: [Family]) => {
    const [family] = value
    return [
      family?.street,
      family?.suite,
      family?.city,
      family?.state,
      family?.zip,
      family?.country,
    ]
      .filter((v) => v !== undefined)
      .join(" ")
  }

  const columns: GridColDef<WaitlistRow>[] = [
    {
      field: "index",
      headerName: "Index",
      type: "number",
      width: 20,
      ...DataGridColumnAlign,
    },
    {
      field: "name",
      headerName: "Name",
      minWidth: 130,
      maxWidth: 150,
      flex: 0.25,
      ...DataGridColumnAlign,
    },
    {
      field: "campTrack",
      headerName: "Camp Track",
      type: "string",
      width: 100,
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
      field: "numPastRegistrations",
      headerName: "# Past Regs",
      type: "number",
      width: 100,
      ...DataGridColumnAlign,
    },
    {
      field: "parentNames",
      headerName: "Parent Names",
      type: "string",
      minWidth: 150,
      maxWidth: 175,
      flex: 0.25,
      ...DataGridColumnAlign,
    },
    {
      field: "parentEmails",
      headerName: "Parent Emails",
      type: "string",
      minWidth: 150,
      maxWidth: 250,
      flex: 1,
      ...DataGridColumnAlign,
    },
    {
      field: "address",
      headerName: "Address",
      minWidth: 250,
      maxWidth: 350,
      flex: 1,
      ...DataGridColumnAlign,
      valueFormatter: addressValueFormatter,
      renderCell: (params: GridRenderCellParams<any, [Family]>) => {
        const [family] = params.value
        return (
          <Stack
            direction="column"
            sx={{
              justifyContent: "flex-start",
              alignItems: "flex-start",
              pl: 1,
            }}
          >
            <span>{family?.street}</span>
            <span>
              {family?.city}, {family?.state} {family?.zip}
            </span>
          </Stack>
        )
      },
    },
    {
      field: "waitlistTime",
      headerName: "Waitlist Time",
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
    {
      field: "moveOffWaitlist",
      headerName: "Action",
      minWidth: 150,
      ...DataGridColumnAlign,
      sortable: false,
      disableExport: true,
      renderCell: MoveOffWaitlistButton,
    },
  ]

  // TODO: Make this auto get the values from the field in WaitlistColumns
  const rows: WaitlistRow[] = waitlist.map((reg, index) => ({
    id: index.toString(),
    index: index + 1,
    name: reg.camperName,
    campTrack: reg.campTrack,
    grade: reg.grade,
    numPastRegistrations: reg.registrations?.length,
    // Join the parent's names if they exist.
    parentNames: getParentNames(reg),
    // Join the parent's emails if they exist.
    parentEmails: getParentEmails(reg),
    address: [reg.familyData],
    internalNotes: reg.internalNotes,
    waitlistTime: reg.waitlistTime?.toDate() ?? new Date(),
    // waitlistTime: reg.waitlistTime
    //   ? // @ts-ignore reg.waitlistTime is already handled
    //     dayjs(reg.waitlistTime).toDate()
    //   : new Date(),
  }))

  return (
    <>
      <Card>
        <CardHeader
          title="Waitlist"
          titleTypographyProps={{
            align: "center",
            variant: "h4",
          }}
        />

        <Table
          rows={rows}
          columns={columns}
          loading={loading}
          updateRow={updateRow}
          hiddenColumns={["address"]}
        />
      </Card>
      <ConfirmMoveOffWaitlistDialog
        context={moveOffWaitlistContext}
        setContext={setMoveOffWaitlistContext}
      />
    </>
  )
}
