import React from "react"
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material"

import {
  CampYear,
  CampTrackInfo,
  getRegistrationPrice,
  RegistrationStatus,
} from "lyf-registration-schemas"
import { RegistrationDocumentWithCamperId } from "@hooks/useFamilyData"

import { RegistrationData } from "./RegistrationDataContext"

type Registrations = RegistrationData["campers"]

type ReviewStepOrderSummaryProps = {
  campCredit: number
  campInfo: CampYear
  campTracksInfo: CampTrackInfo[]
  donation: number
  preRegistrations: RegistrationDocumentWithCamperId[]
  registrationData: RegistrationData
}

type LineItem = {
  description: string
  quantity: number
  total: number
}

/**
 * Create line items for the registration.
 * @param registrations
 * @param campTracksInfo
 * @param price
 * @param description
 * @returns
 */
function createRegistrationLineItem(
  registrations: Registrations,
  campTracksInfo: CampTrackInfo[],
  price: number,
  description: string
): LineItem[] {
  // Split the registration into their respective camp tracks
  const splitRegistrations = campTracksInfo
    .map((campTrack) => ({
      campTrack: campTrack.track,
      remainingSpots: campTrack.remainingSpots,
      numRegistrations: registrations.filter(
        (reg) =>
          reg.campTrack === campTrack.track &&
          reg.status != RegistrationStatus.PENDING_PAYMENT
      ).length,
    }))
    .filter(({ numRegistrations }) => numRegistrations > 0)

  // Off the waitlist
  const splitRegistrationsOffWaitlist = campTracksInfo
    .map((campTrack) => ({
      campTrack: campTrack.track,
      remainingSpots: campTrack.remainingSpots,
      numRegistrations: registrations.filter(
        (reg) =>
          reg.campTrack === campTrack.track &&
          reg.status == RegistrationStatus.PENDING_PAYMENT
      ).length,
    }))
    .filter(({ numRegistrations }) => numRegistrations > 0)

  const normalRegistrationsByTrack = splitRegistrations.map(
    ({ campTrack, remainingSpots, numRegistrations }) => {
      // We actually allow parents to still register their campers even if
      // the number of campers they're registering is more than the remaining spots.
      // This is so we can keep families together.
      const isWaitlist = remainingSpots <= 0
      const s = numRegistrations > 1 ? "s" : ""
      const waitlistMessage = isWaitlist ? " - Waitlist" : ""

      return {
        description: `${description}${s} (${campTrack})${waitlistMessage}`,
        quantity: numRegistrations,
        total: isWaitlist ? 0 : price * numRegistrations,
      }
    }
  )

  const offWaitlistRegistrationsByTrack = splitRegistrationsOffWaitlist.map(
    ({ campTrack, numRegistrations }) => {
      const s = numRegistrations > 1 ? "s" : ""

      return {
        description: `${description}${s} (${campTrack})`,
        quantity: numRegistrations,
        total: price * numRegistrations,
      }
    }
  )

  return [...normalRegistrationsByTrack, ...offWaitlistRegistrationsByTrack]
}

const getTotal = (lineItems: LineItem[]) =>
  lineItems.map(({ total }) => total).reduce((prev, cur) => prev + cur, 0)

export default function ReviewStepOrderSummaryItems({
  campCredit,
  campInfo,
  campTracksInfo,
  donation,
  preRegistrations,
  registrationData,
}: ReviewStepOrderSummaryProps) {
  const preRegisteredPrice =
    campInfo.registrationFee - campInfo.preRegistrationFee
  const generalPrice = getRegistrationPrice(campInfo)

  // Split out the pre-registered vs generalReg campers
  const preRegisteredCampers: Registrations = []
  const generalRegCampers: Registrations = []
  registrationData.campers.forEach((camper) => {
    const isPreRegistered = preRegistrations.find(
      (preReg) =>
        preReg.camperId === camper.id ||
        preReg.camperName === `${camper.firstName} ${camper.lastName}`
    )

    if (isPreRegistered) {
      preRegisteredCampers.push(camper)
    } else {
      generalRegCampers.push(camper)
    }
  })

  // Split out by camp tracks
  const lineItems: LineItem[] = []

  lineItems.push(
    ...createRegistrationLineItem(
      preRegisteredCampers,
      campTracksInfo,
      preRegisteredPrice,
      "Pre-Registered Camper"
    )
  )
  lineItems.push(
    ...createRegistrationLineItem(
      generalRegCampers,
      campTracksInfo,
      generalPrice,
      "Camper"
    )
  )

  const registrationTotal = getTotal(lineItems)

  // Add any sibling discount
  // TODO: Handle the case for campers on waitlist who get moved off the waitlist later without their sibling from
  // the other camp track. Also handle the case where one kid is on not waitlisted camp track
  const siblingDiscount = campInfo.siblingDiscount ?? 0
  if (
    registrationTotal > 0 &&
    siblingDiscount > 0 &&
    registrationData.campers.length > 1
  ) {
    lineItems.push({
      description: "Campers Sibling Discount",
      quantity: registrationData.campers.length,
      total: -1 * registrationData.campers.length * campInfo.siblingDiscount,
    })
  }

  const registrationTotalWithDiscount = getTotal(lineItems)

  // Add any camp credit
  if (registrationTotalWithDiscount > 0 && campCredit) {
    lineItems.push({
      description: "Camp Credit",
      quantity: 1,
      total: -1 * Math.min(campCredit, registrationTotalWithDiscount),
    })
  }

  // We'll show donation separately so don't add it explicitly to line items
  const total = getTotal(lineItems) + donation

  return (
    <List>
      {/* Display all the line items */}
      {lineItems.map(({ description, quantity, total }) => (
        <ListItem
          key={description}
          secondaryAction={
            <Typography textAlign="right">
              {total >= 0 ? <b>${total}</b> : <b>-${total * -1}</b>}
            </Typography>
          }
        >
          <ListItemText
            primary={`${quantity}x ${description}`}
            secondary={
              total == 0 ? "Registration fee not charged at this time" : ""
            }
          />
        </ListItem>
      ))}

      {/* Display the donation if provided */}
      {donation > 0 && (
        <ListItem
          secondaryAction={
            <Typography textAlign="right">
              <b>${donation}</b>
            </Typography>
          }
        >
          Donation
        </ListItem>
      )}
      <Divider
        sx={{
          borderColor: "secondary.main",
          borderWidth: 1,
        }}
      />
      <ListItem
        secondaryAction={
          <Typography>
            <b>${total}</b>
          </Typography>
        }
      >
        <Typography variant="h6">Order Total</Typography>
      </ListItem>
    </List>
  )
}
