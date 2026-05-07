import * as React from "react"
import {
  Container,
  Grid,
  Stack,
  Tabs,
  Tab,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs from "dayjs"

import AuthContext from "@components/Auth/AuthContext"
import { LinkButton } from "@components/Button"
import { ProdContext } from "@components/ProdContext"
import {
  Demographics,
  PendingPayments,
  RegistrationDashboard,
  Waitlist,
  CamperCheckout,
  CreateTestData,
} from "@components/Admin"
import { SmallGroupAssignmentsV2 } from "@components/SmallGroupAndCabinAssignments"
import useRegistrations from "@hooks/useRegistrations"
import getPageTitle from "@utils/getPageTitle"
import TabPanel from "@components/TabPanel"
import { SnackbarAlertProvider } from "@components/SnackbarAlert"
import PaymentDashboard from "@components/Admin/PaymentDashboard"
import CampCreditTab from "@components/Admin/CampCreditTab"

const enum AdminTab {
  ALL_REGISTRATIONS,
  WAITLIST_PENDING_PAYMENTS,
  DEMOGRAPHICS,
  PAYMENTS,
  CAMPER_CHECKOUT,
  CAMP_CREDITS,
  CREATE_TEST_DATA,
  SMALL_GROUP_ASSIGNMENTS,
}

const AdminPage: React.FC = () => {
  const { isAdmin } = React.useContext(AuthContext)
  const { firestore } = React.useContext(ProdContext)
  const [year, setYear] = React.useState<number>(dayjs().year())
  const [data, loading, error] = useRegistrations({
    isAdmin,
    campYear: year,
    firestore,
  })
  const [tab, setTab] = React.useState<AdminTab>(AdminTab.ALL_REGISTRATIONS)
  const handleChange = (_: React.SyntheticEvent, newTab: AdminTab) =>
    setTab(newTab)

  // Media query used for some of the layout params below.
  const theme = useTheme()
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"))

  if (!isAdmin) {
    return (
      <Container maxWidth="xl" sx={{ padding: 6 }}>
        <Stack justifyContent="center" spacing={2}>
          <Typography variant="h3" align="center">
            You do not have access to this page.
          </Typography>
          <LinkButton to="/" size="large">
            Return to Home Page
          </LinkButton>
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ padding: 1 }}>
      <Typography variant="h2" textAlign="center" sx={{ padding: 2 }}>
        Admin Dashboard
      </Typography>
      {error && <Typography>{error.message}</Typography>}
      <Grid container justifyContent="center">
        <DatePicker
          value={dayjs().set("year", year)}
          onChange={(newYear) => setYear(newYear?.year() || dayjs().year())}
          views={["year"]}
          minDate={dayjs().set("year", 2017)}
          maxDate={dayjs().add(1, "year")}
        />
      </Grid>
      <Tabs
        value={tab}
        onChange={handleChange}
        aria-label="admin-tabs"
        centered={isLargeScreen}
        variant={isLargeScreen ? "standard" : "scrollable"}
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Tab label="All Registrations" id="tab-all-registrations" />
        <Tab label="Waitlist and Pending Payments" id="tab-waitlist" />
        <Tab label="Demographics" id="tab-demographics" />
        <Tab label="Payments" id="tab-payments" />
        <Tab label="Camper Checkout" id="tab-camper-checkout" />
        <Tab label="Camp Credits" id="tab-camp-credits" />
        <Tab label="Create Test Data" id="tab-create-test-data" />
        <Tab label="Small Group Assignments" id="tab-small-group-assignments" />
      </Tabs>
      <SnackbarAlertProvider>
        <TabPanel index={0} value={tab} id="all-registrations">
          <RegistrationDashboard
            data={data}
            loading={loading}
            campYear={year}
          />
        </TabPanel>
        <TabPanel index={1} value={tab} id="waitlist">
          <Grid container justifyContent="center" spacing={1}>
            <Grid size={12}>
              <Waitlist data={data} loading={loading} campYear={year} />
            </Grid>
            <Grid size={12}>
              <PendingPayments data={data} loading={loading} />
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel index={2} value={tab} id="demographics">
          <Demographics data={data} />
        </TabPanel>
        <TabPanel index={3} value={tab} id="payments">
          <PaymentDashboard />
        </TabPanel>
        <TabPanel index={4} value={tab} id="camper-checkout">
          <CamperCheckout data={data} loading={loading} />
        </TabPanel>
        <TabPanel index={5} value={tab} id="camp-credits">
          <CampCreditTab />
        </TabPanel>
        <TabPanel index={6} value={tab} id="create-test-data">
          <CreateTestData campYear={year} />
        </TabPanel>
        <TabPanel index={7} value={tab} id="small-group-assignments">
          {/* <SmallGroupAssignments registrations={data} /> */}
          <SmallGroupAssignmentsV2 registrations={data} campYear={year}/>
        </TabPanel>
      </SnackbarAlertProvider>
    </Container>
  )
}

export default AdminPage

export const Head = getPageTitle("Admin")
