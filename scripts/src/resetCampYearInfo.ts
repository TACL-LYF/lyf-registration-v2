import * as admin from "firebase-admin"
import {CampTrack} from "lyf-registration-schemas"

// Initialize the firebase Admin SDK so we can perform operations
admin.initializeApp()
const db = admin.firestore()

db.settings({
  databaseId: "internal-test",
})

async function main() {
  const campYearRef = db.collection("camps").doc("2025")

  await campYearRef.set({
    campEndDate: new Date("July 20, 2025  03:00:00 PM UTC-7"),
    campStartDate: new Date("July 14, 2025 03:00:00 PM UTC-7"),
    campTotalSizeCap: 185,
    campSizeCaps: {
      [CampTrack.YOUNGER]: 85,
      [CampTrack.OLDER]: 85,
    },

    campsite: "Alliance Redwoods Conference Grounds",
    campsiteAddress: "6250 Bohemian Hwy, Occidental, CA 95465",

    earlyRegEndDate: new Date("January 31, 2025 12:00:00 PM UTC-8"),
    earlyRegOpenDate: new Date("January 11, 2025 12:00:00 PM UTC-8"),

    name: "",

    preRegistrationFee: 500,
    registrationCloseDate: new Date("May 16, 2025 12:00:00 PM UTC-7"),
    registrationFee: 1325,
    registrationLateDate: new Date("March 31, 2025 12:00:00 PM UTC-7"),
    registrationLateFee: 1525,
    registrationOpenDate: new Date("February 1, 2025 12:00:00 PM UTC-8"),

    shirtPrice: 0,
    siblingDiscount: 0,

    remainingSpots: {
      [CampTrack.YOUNGER]: 85,
      [CampTrack.OLDER]: 85,
    },
  })
}

main()
  .then(() => console.log("Success"))
  .catch((e) => console.error(e))
