import { GridColDef } from "@mui/x-data-grid"

export const DataGridColumnAlign: Pick<GridColDef, "align" | "headerAlign" | "cellClassName"> = {
  align: "center",
  headerAlign: "center",
  cellClassName: "centered-text-cell",
}