import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  List,
  ListItem,
} from "@mui/material"
import { RegistrationData } from "@hooks/useRegistrations"

type SmallGroupProps = {
  name: string
  boys: RegistrationData[]
  girls: RegistrationData[]
  nonBinary: RegistrationData[]
}

const createSmallGroupListItems = (registrations: RegistrationData[]) => {
  const sortCamperNameFunction = (a: RegistrationData, b: RegistrationData) =>
    a.camperName.localeCompare(b.camperName)
  return registrations
    .sort(sortCamperNameFunction)
    .map(({ camperName, grade }) => {
      return (
        <ListItem key={camperName} sx={{ display: "list-item" }}>
          {camperName} ({grade})
        </ListItem>
      )
    })
}

export default function SmallGroup({
  name,
  boys,
  girls,
  nonBinary,
}: SmallGroupProps) {
  const totalCampers = boys.length + girls.length + nonBinary.length
  const [girlsListItems, boysListItems, nonBinaryListItems] = [
    girls,
    boys,
    nonBinary,
  ].map(createSmallGroupListItems)

  return (
    <>
      <Card variant="outlined" sx={{ height: 1 }}>
        <CardHeader title={`Group ${name}`} />
        <CardContent>
          <Typography>
            Total campers: <b>{totalCampers}</b>
          </Typography>
          <Grid container>
            {Object.entries({
              Girls: girlsListItems,
              Boys: boysListItems,
              "Non-Binary": nonBinaryListItems,
            }).map(([genderTitle, listItems]) => {
              const columnSize = nonBinaryListItems.length > 0 ? 4 : 6
              return (
                listItems.length > 0 && (
                  <Grid xs={columnSize} item={true} key={genderTitle}>
                    <Typography>
                      <b>{listItems.length}</b> {genderTitle}
                    </Typography>
                    <List sx={{ listStyle: "decimal", pl: 2.5 }}>
                      {listItems}
                    </List>
                  </Grid>
                )
              )
            })}
          </Grid>
        </CardContent>
      </Card>
    </>
  )
}
