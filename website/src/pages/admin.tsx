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
import AdminManagement from "@components/Admin/AdminManagement"

const enum AdminTab {
  ALL_REGISTRATIONS,
  WAITLIST_PENDING_PAYMENTS,
  DEMOGRAPHICS,
  PAYMENTS,
  CAMPER_CHECKOUT,
  CAMP_CREDITS,
  CREATE_TEST_DATA,
  SMALL_GROUP_ASSIGNMENTS,
  ADMIN_MANAGEMENT,
}

const AdminPage: React.FC = () => {
  const { isAdmin, adminRole } = React.useContext(AuthContext)
  const { firestore } = React.useContext(ProdContext)
  const [year, setYear] = React.useState<number>(dayjs().year())
  const [data, loading, error] = useRegistrations({
    isAdmin,
    adminRole,
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
        <Tab value={AdminTab.ALL_REGISTRATIONS} label="All Registrations" id="tab-all-registrations" />
        <Tab value={AdminTab.WAITLIST_PENDING_PAYMENTS} label="Waitlist and Pending Payments" id="tab-waitlist" />
        {adminRole === "full_admin" && (
          <Tab value={AdminTab.DEMOGRAPHICS} label="Demographics" id="tab-demographics" />
        )}
        {adminRole === "full_admin" && (
          <Tab value={AdminTab.PAYMENTS} label="Payments" id="tab-payments" />
        )}
        <Tab value={AdminTab.CAMPER_CHECKOUT} label="Camper Checkout" id="tab-camper-checkout" />
        {adminRole === "full_admin" && (
          <Tab value={AdminTab.CAMP_CREDITS} label="Camp Credits" id="tab-camp-credits" />
        )}
        {adminRole === "full_admin" && (
          <Tab value={AdminTab.CREATE_TEST_DATA} label="Create Test Data" id="tab-create-test-data" />
        )}
        <Tab value={AdminTab.SMALL_GROUP_ASSIGNMENTS} label="Small Group Assignments" id="tab-small-group-assignments" />
        {adminRole === "full_admin" && (
          <Tab value={AdminTab.ADMIN_MANAGEMENT} label="Admin Management" id="tab-admin-management" />
        )}
      </Tabs>
      <SnackbarAlertProvider>
        <TabPanel index={AdminTab.ALL_REGISTRATIONS} value={tab} id="all-registrations">
          <RegistrationDashboard
            data={data}
            loading={loading}
            campYear={year}
            adminRole={adminRole}
          />
        </TabPanel>
        <TabPanel index={AdminTab.WAITLIST_PENDING_PAYMENTS} value={tab} id="waitlist">
          <Grid container justifyContent="center" spacing={1}>
            <Grid size={12}>
              <Waitlist data={data} loading={loading} campYear={year} />
            </Grid>
            <Grid size={12}>
              <PendingPayments data={data} loading={loading} />
            </Grid>
          </Grid>
        </TabPanel>
        {adminRole === "full_admin" && (
          <TabPanel index={AdminTab.DEMOGRAPHICS} value={tab} id="demographics">
            <Demographics data={data} />
          </TabPanel>
        )}
        {adminRole === "full_admin" && (
          <TabPanel index={AdminTab.PAYMENTS} value={tab} id="payments">
            <PaymentDashboard />
          </TabPanel>
        )}
        <TabPanel index={AdminTab.CAMPER_CHECKOUT} value={tab} id="camper-checkout">
          <CamperCheckout data={data} loading={loading} />
        </TabPanel>
        {adminRole === "full_admin" && (
          <TabPanel index={AdminTab.CAMP_CREDITS} value={tab} id="camp-credits">
            <CampCreditTab />
          </TabPanel>
        )}
        {adminRole === "full_admin" && (
          <TabPanel index={AdminTab.CREATE_TEST_DATA} value={tab} id="create-test-data">
            <CreateTestData campYear={year} />
          </TabPanel>
        )}
        <TabPanel index={AdminTab.SMALL_GROUP_ASSIGNMENTS} value={tab} id="small-group-assignments">
          <SmallGroupAssignmentsV2 registrations={data} campYear={year}/>
        </TabPanel>
        {adminRole === "full_admin" && (
          <TabPanel index={AdminTab.ADMIN_MANAGEMENT} value={tab} id="admin-management">
            <AdminManagement />
          </TabPanel>
        )}
      </SnackbarAlertProvider>
    </Container>
  )
}

export default AdminPage

export const Head = getPageTitle("Admin")
