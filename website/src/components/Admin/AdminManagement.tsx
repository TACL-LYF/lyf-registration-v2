import React from "react"
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import {
  ADMIN_ROLES,
  AdminRole,
  normalizeEmail,
  resolveAdminRole,
} from "lyf-registration-schemas"

import AuthContext from "@components/Auth/AuthContext"
import { ProdContext } from "@components/ProdContext"
import { SnackbarAlertContext } from "@components/SnackbarAlert"

type AdminEntry = {
  email: string
  // null when the stored role value is missing or unrecognized (fails closed)
  role: AdminRole | null
  addedBy: string
  addedAt?: Date
}

const ROLE_LABELS: Record<AdminRole, string> = {
  full_admin: "Full Admin",
  program_staff: "Program Staff",
  health_staff: "Health Staff",
}

export default function AdminManagement() {
  const { user } = React.useContext(AuthContext)
  const { firestore } = React.useContext(ProdContext)
  const { setSnackbar } = React.useContext(SnackbarAlertContext)
  const [admins, setAdmins] = React.useState<AdminEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [newEmail, setNewEmail] = React.useState("")
  const [newRole, setNewRole] = React.useState<AdminRole>("program_staff")
  const [submitting, setSubmitting] = React.useState(false)

  const fetchAdmins = React.useCallback(async () => {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(firestore, "admins"))
      const entries: AdminEntry[] = snapshot.docs.map((d) => ({
        email: d.id,
        role: resolveAdminRole(d.data().role),
        addedBy: d.data().addedBy ?? "unknown",
        addedAt: d.data().addedAt?.toDate?.() ?? undefined,
      }))
      entries.sort((a, b) => a.email.localeCompare(b.email))
      setAdmins(entries)
    } catch (err) {
      setSnackbar({ children: "Failed to load admins", severity: "error" })
    } finally {
      setLoading(false)
    }
  }, [setSnackbar])

  React.useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = normalizeEmail(newEmail)
    if (!email) return

    if (admins.some((a) => a.email === email)) {
      setSnackbar({ children: "Email is already an admin", severity: "warning" })
      return
    }

    setSubmitting(true)
    try {
      await setDoc(doc(firestore, "admins", email), {
        role: newRole,
        addedBy: user?.email ?? "unknown",
        addedAt: serverTimestamp(),
      })
      setNewEmail("")
      setSnackbar({
        children: `Added ${email} as ${ROLE_LABELS[newRole]}`,
        severity: "success",
      })
      await fetchAdmins()
    } catch (err) {
      setSnackbar({ children: "Failed to add admin", severity: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoleChange = async (email: string, role: AdminRole) => {
    try {
      await updateDoc(doc(firestore, "admins", email), { role })
      setSnackbar({
        children: `Updated ${email} to ${ROLE_LABELS[role]}`,
        severity: "success",
      })
      await fetchAdmins()
    } catch (err) {
      setSnackbar({ children: "Failed to update role", severity: "error" })
    }
  }

  const handleRemove = async (email: string) => {
    if (email === user?.email) {
      setSnackbar({
        children: "You cannot remove yourself as an admin",
        severity: "warning",
      })
      return
    }

    try {
      await deleteDoc(doc(firestore, "admins", email))
      setSnackbar({ children: `Removed ${email} from admins`, severity: "success" })
      await fetchAdmins()
    } catch (err) {
      setSnackbar({ children: "Failed to remove admin", severity: "error" })
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 700, mx: "auto", py: 2 }}>
      <Typography variant="h5">Manage Admins</Typography>

      <Box component="form" onSubmit={handleAdd}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Email address"
            type="email"
            size="small"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            sx={{ flexGrow: 1 }}
            disabled={submitting}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={newRole}
              label="Role"
              onChange={(e) => setNewRole(e.target.value as AdminRole)}
              disabled={submitting}
            >
              {ADMIN_ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !newEmail.trim()}
          >
            {submitting ? <CircularProgress size={20} /> : "Add"}
          </Button>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {admins.length} admin{admins.length !== 1 ? "s" : ""}
        </Typography>
        <List dense>
          {admins.map((admin) => (
            <ListItem
              key={admin.email}
              secondaryAction={
                <Stack direction="row" spacing={1} alignItems="center">
                  {admin.email === user?.email ? (
                    <Chip label="You" size="small" color="primary" />
                  ) : (
                    <IconButton
                      edge="end"
                      aria-label="remove admin"
                      onClick={() => handleRemove(admin.email)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>
              }
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{admin.email}</span>
                    <Select
                      size="small"
                      value={admin.role ?? ""}
                      displayEmpty
                      renderValue={(v) =>
                        v ? ROLE_LABELS[v as AdminRole] : "⚠ Invalid role"
                      }
                      onChange={(e) =>
                        handleRoleChange(admin.email, e.target.value as AdminRole)
                      }
                      disabled={admin.email === user?.email}
                      variant="standard"
                      sx={{ fontSize: "0.875rem" }}
                    >
                      {ADMIN_ROLES.map((role) => (
                        <MenuItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </MenuItem>
                      ))}
                    </Select>
                  </Stack>
                }
                secondary={`Added by ${admin.addedBy}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Stack>
  )
}
