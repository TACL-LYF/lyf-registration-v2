import React from "react"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  FormControlLabel,
  Grid,
  Checkbox,
  FormLabel,
} from "@mui/material"

import { firebaseFunctions } from "@utils/firebaseApp"
import { httpsCallable } from "firebase/functions"
import { FUNCTION_NAMES } from "lyf-registration-schemas"
import { SnackbarAlertContext } from "@components/SnackbarAlert"
import { MoveCampersOffWaitlistRequest } from "lyf-registration-schemas"
import { ProdContext } from "@components/ProdContext"

type Parent = {
  name: string
  email: string | undefined | null
}

export type MoveOffWaitlistContext = {
  parents: Parent[]
  campYear: number
  camperName: string
  registrationId: string
  campTrack: string
}

type ConfirmMoveOffWaitlistDialogProps = {
  context: MoveOffWaitlistContext | null
  setContext: React.Dispatch<MoveOffWaitlistContext | null>
}

// Firebase defined function
const moveCampersOffWaitlist = httpsCallable<
  MoveCampersOffWaitlistRequest,
  {
    status: string
    code: number
    message: string
  }
>(firebaseFunctions, FUNCTION_NAMES.moveCampersOffWaitlist)

export default function ConfirmWaitlistDialogProps({
  context,
  setContext,
}: ConfirmMoveOffWaitlistDialogProps) {
  const [selectedParents, setSelectedParents] = React.useState<Parent[]>([])
  const { setSnackbar } = React.useContext(SnackbarAlertContext)
  const { isTestData } = React.useContext(ProdContext)

  React.useEffect(() => {
    setSelectedParents(context?.parents ?? [])
  }, [context])

  const handleClose = () => setContext(null)
  const handleConfirmation = () => {
    // ! ensures context is not null
    const { parents, ...rest } = context!
    moveCampersOffWaitlist({
      parentNames: selectedParents.map((parent) => parent.name),
      parentEmails: selectedParents.map((parent) => parent.email),
      ...rest,
      isTestData: isTestData,
    })
      .then(() =>
        setSnackbar({
          children: "Successfully sent email to parents",
          severity: "success",
        })
      )
      .catch((err) =>
        setSnackbar({
          children: `Failed to move campers off waitlist: ${err.message}`,
          severity: "error",
        })
      )

    setContext(null)
  }

  return (
    <Dialog open={!!context} onClose={handleClose}>
      <DialogTitle>Move Off Waitlist</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to move <b>{context?.camperName}</b> off the
          waitlist?
        </DialogContentText>

        {/* Parents select */}
        <FormControl
          id="confirm-move-off-waitlist=dialog-parents"
          error={selectedParents.length == 0}
        >
          <FormLabel id="confirm-move-off-waitlist=dialog-parents-label">
            Parents to send email to:
          </FormLabel>

          <Grid container>
            {context?.parents?.map((parent) => (
              <FormControlLabel
                key={parent.name}
                control={
                  <Checkbox
                    checked={selectedParents.some(
                      (p) => p.name === parent.name
                    )}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedParents([...selectedParents, parent])
                      } else {
                        setSelectedParents(
                          selectedParents.filter((p) => p.name !== parent.name)
                        )
                      }
                    }}
                  />
                }
                label={`${parent.name}: ${parent.email ?? ""}`}
              />
            ))}
          </Grid>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>No</Button>
        <Button
          onClick={handleConfirmation}
          autoFocus
          disabled={selectedParents.length == 0}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  )
}
