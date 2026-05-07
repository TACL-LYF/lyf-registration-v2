import * as admin from "firebase-admin"
import * as fs from "fs"

// Initialize the firebase Admin SDK so we can perform operations
admin.initializeApp()
const db = admin.firestore()

async function getCamperAddress() {
  console.log("Getting emails...")

  const registrations = db
    .collection("camps")
    .doc("2024")
    .collection("registrations")
  const activeRegs = await registrations.where("status", "==", "Active").get()

  console.log(`Found ${activeRegs.size} active registrations.`)

  const allAddress: string[][] = []
  await Promise.all(
    activeRegs.docs.map(async (reg) => {
      const camperRef = reg.data().camper as admin.firestore.DocumentReference
      const family = await camperRef.parent.parent?.get()
      const familyData = family?.data()
      if (familyData == undefined) {
        throw `No family found for camper.`
      }

      allAddress.push([
        reg.data().camperName,
        familyData.street ?? "",
        familyData.suite ?? "",
        familyData.city ?? "",
        familyData.state ?? "",
        familyData.zipcode ?? "",
      ])
    })
  )

  console.log(allAddress)
  fs.writeFile("allAddress.txt", allAddress.map((line) =>  line.join("\t")).join("\n"), (err) => {
    if (err) throw err

    console.log("Finished writing to file.")
  })
}

getCamperAddress()
  .then(() => console.log("Finished getting addresses"))
  .catch((err) => console.log(`Failed to get address. ${err}`))
