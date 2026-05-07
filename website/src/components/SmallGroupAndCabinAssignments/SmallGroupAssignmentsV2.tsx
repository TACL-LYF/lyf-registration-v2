import React, { useState, useReducer } from "react"
import {
  Alert,
  AlertProps,
  Collapse,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  Typography,
} from "@mui/material"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import dayjs from "dayjs"

// Small Group Assignments Context
import { RegistrationStatus } from "lyf-registration-schemas"

import { RegistrationData } from "@hooks/useRegistrations"
import { AnimatedButton } from "@components/Button"

import {
  smallGroupReducer,
  SmallGroupState,
  SmallGroupDispatchContext,
  PairingCamper,
  loadFromRegistrations,
  SmallGroupActionType,
  SmallGroupContext,
} from "./SmallGroupContext"
import AddGroupButton from "./AddGroupButton"
import AssignmentsGroup from "./AssignmentsGroup"
import SmallGroupSaveButton from "./SmallGroupSaveButton"

export interface ColumnDef {
  id: string
  label: string
  size: number
  textAlign: "left" | "center" | "right"
  transform: (camper: PairingCamper) => React.ReactNode
}

type SmallGroupAssignmentsV2Props = {
  registrations: RegistrationData[]
  campYear: number
}

function createInitialState(
  registrations: RegistrationData[]
): SmallGroupState {
  const pairings = loadFromRegistrations(registrations)

  return {
    pairings,
    groups: pairings.getGroupsCopy(),
    editStack: [],
    redoStack: [],
    errorMsg: null,
  }
}

const columns: ColumnDef[] = [
  {
    id: "name",
    label: "Camper Name",
    size: 2,
    textAlign: "center",
    transform: (camper) => camper.name,
  },
  {
    id: "experience",
    label: "Camp Experience",
    size: 2,
    textAlign: "center",
    transform: (camper) => camper.metadata.experience,
  },
  {
    id: "cabin",
    label: "Cabin Name",
    size: 2,
    textAlign: "center",
    transform: (camper) => camper.metadata.cabinName,
  },
  {
    id: "gender",
    label: "Gender",
    size: 1,
    textAlign: "center",
    transform: (camper) => camper.metadata.gender,
  },
  {
    id: "age",
    label: "Age",
    size: 1,
    textAlign: "center",
    transform: (camper) =>
      dayjs().diff(dayjs(camper.metadata.birthDate), "year"),
  },
  {
    id: "grade",
    label: "Grade",
    size: 1,
    textAlign: "center",
    transform: (camper) => `${camper.metadata.grade}th`,
  },
  {
    id: "requests",
    label: "Parent Requests",
    size: 2,
    textAlign: "center",
    transform: (camper) => camper.metadata.parentRequests,
  },
  {
    id: "status",
    label: "Status",
    size: 2,
    textAlign: "center",
    transform: (camper) => (
      <Chip
        color={
          camper.metadata.status === RegistrationStatus.ACTIVE
            ? "primary"
            : "error"
        }
        label={camper.metadata.status}
      />
    ),
  },
]

export default function SmallGroupAssignmentsV2({
  registrations,
  campYear,
}: SmallGroupAssignmentsV2Props) {
  const [smallGroupState, dispatch] = useReducer(
    smallGroupReducer,
    createInitialState(registrations)
  )
  const { pairings, groups, editStack, redoStack } = smallGroupState
  const [alertProps, setAlertProps] = useState<AlertProps | null>(null)

  return (
    <SmallGroupDispatchContext.Provider value={dispatch}>
      <SmallGroupContext.Provider value={smallGroupState}>
        <DndProvider backend={HTML5Backend}>
          {/* Alert */}
          <Collapse
            in={alertProps != null}
            sx={{ marginTop: 1, marginBottom: 1 }}
          >
            <Alert {...alertProps} onClose={() => setAlertProps(null)} />
          </Collapse>

          {/* Header + Header Bar */}
          <Grid
            container
            columns={12}
            gap={2}
            sx={{
              width: 1,
              paddingTop: 2,
              paddingBottom: 1,
            }}
          >
            <Grid size={3}>
              <Typography variant="h5">Assignments</Typography>
            </Grid>

            <Grid size={1} offset="auto">
              <AnimatedButton
                boopProps={{
                  scale: 1.05,
                }}
                onClick={() => dispatch({ type: SmallGroupActionType.Undo })}
                disabled={editStack.length === 0}
              >
                Undo
              </AnimatedButton>
            </Grid>

            <Grid size={1}>
              <AnimatedButton
                boopProps={{
                  scale: 1.05,
                }}
                onClick={() => dispatch({ type: SmallGroupActionType.Redo })}
                disabled={redoStack.length === 0}
              >
                Redo
              </AnimatedButton>
            </Grid>

            <Grid size={1}>
              <SmallGroupSaveButton
                campYear={campYear}
                setAlertProps={setAlertProps}
              />
            </Grid>

            <Grid size={1}>
              <AddGroupButton />
            </Grid>

            <Grid size={2}>
              <AnimatedButton
                boopProps={{
                  scale: 1.05,
                }}
                onClick={() =>
                  dispatch({
                    type: SmallGroupActionType.RunPairingAlgorithm,
                    prevPairings: pairings,
                  })
                }
                variant="contained"
              >
                Auto-Pair
              </AnimatedButton>
            </Grid>
          </Grid>

          {/* Main Table */}
          <List dense>
            <ListItem disableGutters>
              <ListItemIcon />
              <Grid container columns={14} sx={{ width: 1 }}>
                {columns.map(({ id, size, label, textAlign }) => (
                  <Grid key={id} size={size}>
                    <Typography align={textAlign}>
                      <b>{label}</b>
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </ListItem>
            <Divider />
            {groups.map((g) => (
              <AssignmentsGroup key={g.id} group={g} columns={columns} />
            ))}
          </List>
        </DndProvider>
      </SmallGroupContext.Provider>
    </SmallGroupDispatchContext.Provider>
  )
}
