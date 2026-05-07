import React from "react"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Typography,
} from "@mui/material"
import { format } from "date-fns"

// Components
import { TableValidRow } from "@components/Table"

export interface RowWithStatusAndNotes extends TableValidRow {
  name: string
  status: string
  internalNotes: string
}

export type CancelStatusPromise = {
  newRow: RowWithStatusAndNotes
  oldRow: RowWithStatusAndNotes
  resolve: (
    value: RowWithStatusAndNotes | PromiseLike<RowWithStatusAndNotes>
  ) => void
  reject: (reason?: any) => void
}

export type CancelStatusDialogProps = {
  context: CancelStatusPromise | null
  setContext: React.Dispatch<CancelStatusPromise | null>
  updateRow: (
    newRow: RowWithStatusAndNotes,
    cancelText: string
  ) => Promise<void>
}

export default function CancelStatusDialog({
  context,
  setContext,
  updateRow,
}: CancelStatusDialogProps) {
  const [cancelText, setCancelText] = React.useState<string | null>("")
  const handleTextChange = (event: React.BaseSyntheticEvent) => {
    setCancelText(event.target.value as string)
  }
  const cancelDateText = `Cancelling ${format(new Date(), "M/d/yy")}: `
  React.useEffect(() => {
    if (context) {
      setCancelText(context.newRow.internalNotes)
    }
  }, [context])

  const handleClose = () => {
    context?.reject(new Error("Not confirmed."))
    setContext(null)
  }

  const handleConfirmation = async () => {
    if (!context) {
      return
    }
    const { newRow, oldRow, resolve, reject } = context

    try {
      await updateRow(newRow, `${cancelDateText}${cancelText || ""}`)
      resolve(newRow)
    } catch (e) {
      reject(new Error("Failed to update row."))
    }
    setContext(null)
  }

  return (
    <Dialog open={!!context} onClose={handleClose}>
      <DialogTitle>Cancel camper</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to cancel registration for{" "}
          {context?.newRow.name}?
        </DialogContentText>
        <TextField
          id="set-cancellation-status-text"
          label="Cancellation Reason"
          onChange={handleTextChange}
          InputProps={{
            startAdornment: (
              <Typography variant="body1" width="15rem">{cancelDateText}</Typography>
            ),
          }}
          sx={{
            marginTop: 2,
          }}
          multiline
          fullWidth
          value={cancelText}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>No</Button>
        <Button onClick={handleConfirmation} autoFocus>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  )
}
