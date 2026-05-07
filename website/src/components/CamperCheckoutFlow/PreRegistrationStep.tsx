import React from "react"
import { Grid } from "@mui/material"

// Components
import { CheckoutFlowStep } from "@components/CheckoutFlow"
import CamperSelection from "./CamperSelection"

// Utils
import { CamperWithRegistration } from "./CamperCheckoutFlow"
import AddCamper from "@components/Camper/AddCamper"

type PreRegistrationStepProps = {
  campers: CamperWithRegistration[]
  preRegisteredCampersIds: string[]
  setPreRegisteredCampersIds: React.Dispatch<string[]>
}

export default function PreRegistrationStep({
  campers,
  preRegisteredCampersIds,
  setPreRegisteredCampersIds,
}: PreRegistrationStepProps) {
  return (
    <CheckoutFlowStep
      index={1}
      title="Select camper(s) you would like to pre-register"
      continueText={
        preRegisteredCampersIds.length > 0
          ? "Continue"
          : "Continue without pre-registering campers"
      }
    >
      <Grid
        container
        spacing={2}
        sx={{ padding: 2 }}
        justifyContent="center"
        alignItems="stretch"
      >
        {campers.map((camper) => (
          <Grid key={camper.firstName}>
            <CamperSelection
              camper={camper}
              preRegisteredCampersIds={preRegisteredCampersIds}
              setPreRegisteredCampersIds={setPreRegisteredCampersIds}
            />
          </Grid>
        ))}
        <Grid size={{ xs: 12, lg: 4 }}>
          <AddCamper
            familyCampersRef={campers.length > 0 ? campers[0].ref.parent : null}
            sx={{ height: 1, width: 1 }}
          />
        </Grid>
      </Grid>
    </CheckoutFlowStep>
  )
}
