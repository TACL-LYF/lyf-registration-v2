import React, { useRef, useState } from "react"
import { getServerDate } from "@nodeguy/server-date"
import dayjs, { Dayjs } from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"

type UseTimeCheckProps = {
  isAdmin: boolean
  isEarlyAccess: boolean
  earlyAccessTimeAfterValid: Dayjs
  timeAfterValid: Dayjs
}

dayjs.extend(customParseFormat)

export default function useTimeCheck({
  isAdmin,
  isEarlyAccess,
  earlyAccessTimeAfterValid,
  timeAfterValid,
}: UseTimeCheckProps): boolean {
  const [date, setDate] = useState<Dayjs>(null)

  if (isAdmin) {
    return true
  }

  // Run the check server date once
  React.useEffect(() => {
    async function checkDate() {
      console.log("Checking server date")
      const { date } = await getServerDate()
      setDate(dayjs(date))
    }

    checkDate()
  }, [])

  return (
    date &&
    date.isAfter(isEarlyAccess ? earlyAccessTimeAfterValid : timeAfterValid)
  )
}
