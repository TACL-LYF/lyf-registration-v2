import React from "react"
import { PageProps } from "gatsby"
import { Typography } from "@mui/material"

// Utils
import getPageTitle from "@utils/getPageTitle"

// Components
import { TimeGated } from "@components/Layout"
import dayjs from "dayjs"

const G = () => {
  return <Typography variant="h1">Not gated</Typography>
}

const TimeGatePage: React.FC<PageProps> = () => {
  return (
    <TimeGated
      hideAfterDateTime={dayjs("2023-07-02 4:00 PM", "YYYY-MM-DD h:mm A")}
      contentIfHidden={<Typography variant="h3">Gated</Typography>}
    >
      <G />
    </TimeGated>
  )
}

export default TimeGatePage

export const Head = getPageTitle("Time Gate")
