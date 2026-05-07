import * as React from "react"

type HookReturn = [HTMLElement | null, boolean, React.MouseEventHandler, React.MouseEventHandler]

export default function useAnchorElement(): HookReturn {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return [
    anchorEl,
    Boolean(anchorEl), // Whether an anchor element is selected.s
    handleClick,
    handleClose
  ]
}
