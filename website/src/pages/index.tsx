import React from "react"
import type { PageProps } from "gatsby"
import {
  CardContent,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material"
import {
  CalendarMonthOutlined,
  ChevronRight,
  EmailOutlined,
  PersonOutlined,
  PlaceOutlined,
} from "@mui/icons-material"

// Utils
import getPageTitle from "@utils/getPageTitle"
import AuthContext from "@components/Auth/AuthContext"

// Components
import { MainHeaderCardWithShadow } from "@components/Card"
import { TriangleBorder } from "@components/FullScreenDesign"
import { AnimatedLinkButton } from "@components/Button"

const IndexPage: React.FC<PageProps> = () => {
  const { isSignedIn, isAdmin } = React.useContext(AuthContext)
  return (
    <Stack alignItems="center" spacing={2}>
      <TriangleBorder />

      <Container
        maxWidth="lg"
        sx={{
          paddingTop: 4,
          paddingLeft: 1,
          paddingRight: 1,
          paddingBottom: 4,
        }}
      >
        <Typography variant="h3" textAlign="center">
          Register for TACL-LYF Camp 2026!
        </Typography>
      </Container>

      <AnimatedLinkButton
        to="/registration"
        boopProps={{
          x: 3,
          scale: 1.01,
        }}
        endIcon={<ChevronRight />}
        color="secondary"
        variant="contained"
      >
        Continue to Registration
      </AnimatedLinkButton>

      {/* Main Content */}
      <Grid container sx={{ padding: 2 }} spacing={3} alignItems="stretch">
        {/* First Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MainHeaderCardWithShadow
            title="2026 Camp Details"
            mainColor="secondary"
          >
            <CardContent
              sx={{
                paddingTop: 1,
                paddingBottom: 1,
                paddingLeft: 3,
                paddingRight: 3,
              }}
            >
              <Stack spacing={1}>
                <List>
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <CalendarMonthOutlined fontSize="large" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Sunday, July 12 - Saturday, July 18"
                      secondary="7 days, 6 nights"
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <PlaceOutlined fontSize="large" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Alliance Redwoods Conference Grounds"
                      secondary="6250 Bohemian Hwy, Occidental, CA 95465"
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <PersonOutlined fontSize="large" />
                    </ListItemIcon>
                    <ListItemText primary="4th - 12th graders" />
                  </ListItem>
                </List>

                <Typography variant="h6">
                  For more information, visit our website{" "}
                  <a href="https://lyf.tacl.org">lyf.tacl.org</a>
                </Typography>
                <Typography color="secondary" variant="body1">
                  <a href="https://lyf.tacl.org/camp/registration-policy/">
                    Details on our registration/cancellation policy
                  </a>
                </Typography>
              </Stack>
            </CardContent>
          </MainHeaderCardWithShadow>
        </Grid>

        {/* Second Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MainHeaderCardWithShadow
            title="Mission Statement"
            mainColor="primary"
          >
            <Stack sx={{ padding: 3 }} justifyContent="center">
              <Typography variant="h6" textAlign="center">
                Become whole person leaders through an understanding of
                heritage, self, and the world.
              </Typography>
            </Stack>
          </MainHeaderCardWithShadow>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MainHeaderCardWithShadow title="Contact Us" mainColor="tertiary">
            <Stack sx={{ padding: 3 }} spacing={1} justifyContent="center">
              <Typography variant="h6">
                Questions about registration? Feel free to reach our team at
              </Typography>

              <ListItem disablePadding>
                <ListItemIcon>
                  <EmailOutlined fontSize="large" />
                </ListItemIcon>
                <ListItemText primary="lyf@tacl.org" />
              </ListItem>
            </Stack>
          </MainHeaderCardWithShadow>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default IndexPage

export const Head = getPageTitle("Registration")
