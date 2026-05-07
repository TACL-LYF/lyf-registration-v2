import * as admin from "firebase-admin"

// Initialize the firebase Admin SDK so we can perform operations
admin.initializeApp()
const db = admin.firestore()

const campers = [
  "Stanley Ko",
  "Jonathan Wu",
  "Naomi Yang",
  "Devin Chang",
  "Aeron Gurskis",
  "Naomi Lin",
  "Anthony Ho",
  "Brandon Chen",
  "Jeffae Schroff",
  "Samantha Lai",
  "Ashley Dong",
  "Lori Liu",
  "Selena Sun",
  "Megan Wu",
  "Keira Lin",
  "Aidan Tseng",
  "Max Lin",
]

async function getParentEmailsForCamper() {
  console.log("Getting campers...")

  campers.forEach(async (camper) => {
    const [firstName, lastName] = camper.split(" ")
    const camperData = await db.collectionGroup("campers").where("firstName", "==", firstName).where("lastName", "==", lastName).get()

    if (camperData.size != 1) {
      console.log(`${camper}: not found ${camperData.size}`)
      return
    }

    const camperRef = camperData.docs[0].ref
    const family = await (camperRef.parent.parent as admin.firestore.DocumentReference).get()
    const familyData = family.data() as any
    console.log(`${firstName} ${lastName}: ${camperData.docs[0].data()["birthDate"]} :  ${familyData["emails"].join(",")}`)
  })

}

getParentEmailsForCamper()
  .then(() => console.log("Finished getting emails"))
  .catch((err) => console.log(`Failed to get emails. ${err}`))
