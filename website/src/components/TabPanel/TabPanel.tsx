import { Box } from "@mui/material"
import React from "react"

type TabPanelProps = React.PropsWithChildren<{
  index: number, 
  value: number,
  id: string
}>

export default function TabPanel({value, index, children, id}: TabPanelProps) {

  return (
    <Box role="tabpanel" hidden={value !== index} id={id} aria-labelledby={`tab-${id}`}>
      {value === index && children}
    </Box>
  )
}