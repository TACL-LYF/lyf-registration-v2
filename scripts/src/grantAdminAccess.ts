import * as admin from "firebase-admin"

// Initialize the firebase Admin SDK so we can perform operations
admin.initializeApp()

// Grant the user with the uid below admin access to our database.
// By the security rules set on our firestore database, this allows them to read and modify any data.
const uid = ""
admin
  .auth()
  .setCustomUserClaims(uid, {admin: true})
  .then(() => console.log(`Granted ${uid} admin access`))
  .catch((err) => console.log(`Error in granting access: ${err}`))
