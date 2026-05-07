import * as React from "react"
import { Link, PageProps } from "gatsby"
import { Stack, Typography } from "@mui/material"

import getPageTitle from "@utils/getPageTitle"

const NotFoundPage: React.FC<PageProps> = () => {
  return (
    <Stack spacing={1} justifyContent="center">
      <Typography variant="h1" textAlign="center">Page not found</Typography>
      <Typography variant="h3" textAlign="center">Sorry 😔, we couldn’t find what you were looking for.</Typography>
      {process.env.NODE_ENV === "development" ? (
          <Typography variant="body1">
            Try creating a page in <code style={{
                color: "#8A6534",
                padding: 4,
                backgroundColor: "#FFF4DB",
                fontSize: "1.25rem",
                borderRadius: 4,
            }}>src/pages/</code>.
          </Typography>
        ) : null}
        <Link to="/">Go home</Link>.
    </Stack>
  )
}

export default NotFoundPage

export const Head = getPageTitle("Not Found")
