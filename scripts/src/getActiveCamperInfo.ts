import * as admin from "firebase-admin"
import * as fs from "fs"

// Initialize the firebase Admin SDK so we can perform operations
admin.initializeApp()
const db = admin.firestore()

async function getActiveCamperInfo() {
  console.log("Getting emails...")

  const registrations = db
    .collection("camps")
    .doc("2023")
    .collection("registrations")
  const activeRegs = await registrations.where("status", "==", "Active").get()

  console.log(`Found ${activeRegs.size} active registrations.`)

  const fieldsWeCareAbout = [
    "grade",
    "internalNotes",
    "additionalNotes",
    "isPreRegistered",
    "shirtSize",
  ]

  const allEmails: string[] = []
  const allInfo: string[][] = []
  await Promise.all(
    activeRegs.docs.map(async (reg) => {
      const camperRef = reg.data().camper as admin.firestore.DocumentReference
      const camper = await camperRef.get()
      const camperData = camper.data()

      let info: string[] = []
      if (camperData) {
        info.push(String(camperData["firstName"]))
        info.push(String(camperData["lastName"]))
        info.push(String(camperData["birthDate"]))
        info.push(String(camperData["gender"][0]))
        info.push(String(camperData["pronouns"]))
        info.push(String(camperData["email"]))
        info.push(String(camperData["medicalConditions"]))
        info.push(String(camperData["dietAndFoodAllergies"]))
      } else {
        for (let i = 0; i < 8; i++) {
          info.push("null")
        }
      }

      info.push(reg.data().grade)
      info.push(reg.data().internalNotes)
      info.push(reg.data().additionalNotes)
      info.push(reg.data().isPreRegistered)
      info.push(reg.data().shirtSize)

      fs.appendFile("activeCamperInfo.txt", info.join(", ") + "\n", (err) => {
        if (err) throw err
      })
    })
  )
}

getActiveCamperInfo()
  .then(() => console.log("Finished getting active camper info"))
  .catch((err) => console.log(`Failed to get active camper info. ${err}`))
