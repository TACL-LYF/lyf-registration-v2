import * as admin from "firebase-admin"
import * as fs from "fs"

// Initialize the firebase Admin SDK so we can perform operations
admin.initializeApp()
const db = admin.firestore()

async function getActiveRegEmails() {
  console.log("Getting emails...")

  const registrations = db
    .collection("camps")
    .doc("2023")
    .collection("registrations")
  const activeRegs = await registrations.where("status", "==", "Active").get()

  console.log(`Found ${activeRegs.size} active registrations.`)

  const allEmails: string[] = []
  await Promise.all(
    activeRegs.docs.map(async (reg) => {
      const camperRef = reg.data().camper as admin.firestore.DocumentReference
      const family = await camperRef.parent.parent?.get()
      const familyData = family?.data()
      if (familyData == undefined) {
        throw `No family found for camper.`
      }

      const emails = familyData.emails as string[]
      emails.forEach((email) => allEmails.push(email))
    })
  )

  console.log(allEmails)
  fs.writeFile("activeRegEmails.txt", allEmails.join(", "), (err) => {
    if (err) throw err

    console.log("Finished writing to file.")
  })
}

getActiveRegEmails()
  .then(() => console.log("Finished getting emails"))
  .catch((err) => console.log(`Failed to get emails. ${err}`))
