import * as admin from "firebase-admin"
import * as fs from "fs"

// Initialize the firebase Admin SDK so we can perform operations
admin.initializeApp()
const db = admin.firestore()

async function getPreRegEmails() {
  console.log("Getting campers...")

  const registrations = db
    .collection("camps")
    .doc("2023")
    .collection("registrations")
  const preRegs = await registrations
    .where("isPreRegistered", "==", true)
    .get()

  console.log(`Found ${preRegs.size} pre-registrations.`)

  const allCampers: string[] = []
  await Promise.all(
    preRegs.docs.map(async (reg) => {
      const camperRef = reg.data().camper as admin.firestore.DocumentReference
      const camper = await camperRef.get()
      const camperData = camper.data()
      const camperName = camperData ? `${camperData["firstName"]} ${camperData["lastName"]}` : `Camper not found`

      allCampers.push(camperName)
    })
  )

  console.log(allCampers.join("\n"))
  fs.writeFile("output/preRegCampers.txt", allCampers.join("\n"), (err) => {
    if (err) throw err

    console.log("Finished writing to file.")
  })
}

getPreRegEmails()
  .then(() => console.log("Finished getting campers"))
  .catch((err) => console.log(`Failed to get campers. ${err}`))
