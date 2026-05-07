import React from "react"
import { Grid, Typography } from "@mui/material"

type ProfileSectionProps = {
  title: string
  nodes: React.ReactNode[]
}

export default function ProfileSection({ title, nodes }: ProfileSectionProps) {
  return (
    <Grid container justifyContent="center">
      <Grid>
        <Typography variant="h3" textAlign="center">
          {title}
        </Typography>
      </Grid>

      {nodes.map((node, index) => (
        <Grid size={{ xs: 12, lg: 4 }} key={`${title}-${index}`}>
          {node}
        </Grid>
      ))}
    </Grid>
  )
}
