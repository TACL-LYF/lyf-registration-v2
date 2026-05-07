/**
 * One-time migration script for RBAC restructure.
 *
 * This script:
 * 1. Copies medicalConditions and dietAndFoodAllergies from each camper doc
 *    into families/{familyId}/campers/{camperId}/private/health
 * 2. Copies demographics from each camper doc
 *    into families/{familyId}/campers/{camperId}/private/demographics
 * 3. Adds role: "full_admin" to all existing admin documents
 *
 * Run with: ./run.sh -n migrateToRbac
 */
import * as admin from "firebase-admin"

admin.initializeApp()
const db = admin.firestore()

async function migrateCamperData() {
  const familiesSnapshot = await db.collection("families").get()
  let camperCount = 0
  let healthCount = 0
  let demographicsCount = 0

  for (const familyDoc of familiesSnapshot.docs) {
    const campersSnapshot = await familyDoc.ref.collection("campers").get()

    for (const camperDoc of campersSnapshot.docs) {
      const data = camperDoc.data()
      camperCount++

      // Migrate health fields to private/health sub-doc
      const healthData: Record<string, unknown> = {}
      if (data.medicalConditions !== undefined) {
        healthData.medicalConditions = data.medicalConditions
      }
      if (data.dietAndFoodAllergies !== undefined) {
        healthData.dietAndFoodAllergies = data.dietAndFoodAllergies
      }

      if (Object.keys(healthData).length > 0) {
        await camperDoc.ref
          .collection("private")
          .doc("health")
          .set(healthData, {merge: true})
        healthCount++
      }

      // Migrate demographics to private/demographics sub-doc
      if (data.demographics && Object.keys(data.demographics).length > 0) {
        await camperDoc.ref
          .collection("private")
          .doc("demographics")
          .set(data.demographics, {merge: true})
        demographicsCount++
      }
    }
  }

  console.log(`Processed ${camperCount} campers`)
  console.log(`  - Migrated ${healthCount} health sub-docs`)
  console.log(`  - Migrated ${demographicsCount} demographics sub-docs`)
}

async function migrateAdminRoles() {
  const adminsSnapshot = await db.collection("admins").get()
  let count = 0

  for (const adminDoc of adminsSnapshot.docs) {
    const data = adminDoc.data()
    if (!data.role) {
      await adminDoc.ref.update({role: "full_admin"})
      count++
    }
  }

  console.log(`Added role: "full_admin" to ${count} existing admin docs`)
}

async function main() {
  console.log("Starting RBAC migration...\n")

  console.log("Step 1: Migrating camper health and demographics to private sub-docs...")
  await migrateCamperData()

  console.log("\nStep 2: Adding roles to existing admin documents...")
  await migrateAdminRoles()

  console.log("\nMigration complete!")
  console.log(
    "NOTE: Original fields on camper docs have NOT been deleted for backward compatibility."
  )
  console.log(
    "Run a separate cleanup script after verifying the new structure works."
  )
  process.exit(0)
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
