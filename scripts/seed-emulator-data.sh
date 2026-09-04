#!/bin/bash
# Seeds the Firestore emulator with fake camper/family/registration data
# for testing the admin dashboard.
# Run AFTER `firebase emulators:start` and `seed-emulator.sh`.
#
# Usage: ./scripts/seed-emulator-data.sh

FIRESTORE_HOST="http://127.0.0.1:8080"
PROJECT_ID="${FIREBASE_PROJECT_ID:-lyf-registration}"
# v2 data lives in a named database; "(default)" belongs to v1
DATABASE_ID="${FIRESTORE_DATABASE_ID:-lyf-v2}"
AUTH="Authorization: Bearer owner"
BASE_URL="${FIRESTORE_HOST}/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents"
CAMP_YEAR="2026"

echo "Seeding fake registration data into Firestore emulator..."

# Helper to create a document
create_doc() {
  local path="$1"
  local data="$2"
  curl -s -X PATCH "${BASE_URL}/${path}" \
    -H "Content-Type: application/json" \
    -H "${AUTH}" \
    -d "${data}" > /dev/null
}

# --- Family 1: Chen family with 2 campers ---
FAMILY1_ID="family-chen-001"

create_doc "families/${FAMILY1_ID}?updateMask.fieldPaths=emails&updateMask.fieldPaths=city&updateMask.fieldPaths=state&updateMask.fieldPaths=zip&updateMask.fieldPaths=street" '{
  "fields": {
    "emails": { "arrayValue": { "values": [{"stringValue": "sarah.chen@email.com"}, {"stringValue": "mike.chen@email.com"}] } },
    "city": { "stringValue": "Los Angeles" },
    "state": { "stringValue": "CA" },
    "zip": { "stringValue": "90012" },
    "street": { "stringValue": "456 Oak Ave" }
  }
}'
echo "  ✔ Family: Chen"

create_doc "families/${FAMILY1_ID}/parents/sarah.chen@email.com?updateMask.fieldPaths=email&updateMask.fieldPaths=firstName&updateMask.fieldPaths=lastName&updateMask.fieldPaths=phoneNumber" '{
  "fields": {
    "email": { "stringValue": "sarah.chen@email.com" },
    "firstName": { "stringValue": "Sarah" },
    "lastName": { "stringValue": "Chen" },
    "phoneNumber": { "stringValue": "310-555-1234" }
  }
}'

create_doc "families/${FAMILY1_ID}/parents/mike.chen@email.com?updateMask.fieldPaths=email&updateMask.fieldPaths=firstName&updateMask.fieldPaths=lastName&updateMask.fieldPaths=phoneNumber" '{
  "fields": {
    "email": { "stringValue": "mike.chen@email.com" },
    "firstName": { "stringValue": "Mike" },
    "lastName": { "stringValue": "Chen" },
    "phoneNumber": { "stringValue": "310-555-5678" }
  }
}'

# Camper 1: Lily Chen
CAMPER1_ID="camper-lily-001"
create_doc "families/${FAMILY1_ID}/campers/${CAMPER1_ID}?updateMask.fieldPaths=firstName&updateMask.fieldPaths=lastName&updateMask.fieldPaths=preferredName&updateMask.fieldPaths=birthDate&updateMask.fieldPaths=gender&updateMask.fieldPaths=pronouns" '{
  "fields": {
    "firstName": { "stringValue": "Lily" },
    "lastName": { "stringValue": "Chen" },
    "preferredName": { "nullValue": null },
    "birthDate": { "stringValue": "2015-03-14" },
    "gender": { "arrayValue": { "values": [{"stringValue": "Female"}] } },
    "pronouns": { "stringValue": "she/her" }
  }
}'

create_doc "families/${FAMILY1_ID}/campers/${CAMPER1_ID}/private/health?updateMask.fieldPaths=medicalConditions&updateMask.fieldPaths=dietAndFoodAllergies" '{
  "fields": {
    "medicalConditions": { "stringValue": "Mild asthma, carries inhaler" },
    "dietAndFoodAllergies": { "stringValue": "Peanut allergy (EpiPen in bag)" }
  }
}'

create_doc "families/${FAMILY1_ID}/campers/${CAMPER1_ID}/private/demographics?updateMask.fieldPaths=born&updateMask.fieldPaths=ethnicity&updateMask.fieldPaths=generation&updateMask.fieldPaths=mandarinLanguage" '{
  "fields": {
    "born": { "stringValue": "USA" },
    "ethnicity": { "arrayValue": { "values": [{"stringValue": "Taiwanese"}] } },
    "generation": { "stringValue": "2nd" },
    "mandarinLanguage": { "stringValue": "Intermediate" }
  }
}'
echo "  ✔ Camper: Lily Chen"

# Registration for Lily
REG1_ID="reg-lily-2026"
create_doc "camps/${CAMP_YEAR}/registrations/${REG1_ID}?updateMask.fieldPaths=camperName&updateMask.fieldPaths=camper&updateMask.fieldPaths=campTrack&updateMask.fieldPaths=grade&updateMask.fieldPaths=status&updateMask.fieldPaths=shirtSize&updateMask.fieldPaths=isReturning&updateMask.fieldPaths=isPreRegistered&updateMask.fieldPaths=cabinPreference&updateMask.fieldPaths=familyEmails&updateMask.fieldPaths=createdAt&updateMask.fieldPaths=updatedAt" "{
  \"fields\": {
    \"camperName\": { \"stringValue\": \"Lily Chen\" },
    \"camper\": { \"referenceValue\": \"projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/families/${FAMILY1_ID}/campers/${CAMPER1_ID}\" },
    \"campTrack\": { \"stringValue\": \"Younger\" },
    \"grade\": { \"integerValue\": \"5\" },
    \"status\": { \"stringValue\": \"Active\" },
    \"shirtSize\": { \"stringValue\": \"YM\" },
    \"isReturning\": { \"booleanValue\": true },
    \"isPreRegistered\": { \"booleanValue\": true },
    \"cabinPreference\": { \"stringValue\": \"With cousin Emily\" },
    \"familyEmails\": { \"arrayValue\": { \"values\": [{\"stringValue\": \"sarah.chen@email.com\"}, {\"stringValue\": \"mike.chen@email.com\"}] } },
    \"createdAt\": { \"timestampValue\": \"2026-02-15T10:30:00Z\" },
    \"updatedAt\": { \"timestampValue\": \"2026-02-15T10:30:00Z\" }
  }
}"
echo "  ✔ Registration: Lily Chen (Active, Younger)"

# Link the camper back to its registration (the registration flow does this via arrayUnion)
create_doc "families/${FAMILY1_ID}/campers/${CAMPER1_ID}?updateMask.fieldPaths=registrations" "{
  \"fields\": {
    \"registrations\": { \"arrayValue\": { \"values\": [{\"referenceValue\": \"projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/camps/${CAMP_YEAR}/registrations/${REG1_ID}\"}] } }
  }
}"

# Camper 2: Jason Chen
CAMPER2_ID="camper-jason-001"
create_doc "families/${FAMILY1_ID}/campers/${CAMPER2_ID}?updateMask.fieldPaths=firstName&updateMask.fieldPaths=lastName&updateMask.fieldPaths=preferredName&updateMask.fieldPaths=birthDate&updateMask.fieldPaths=gender&updateMask.fieldPaths=pronouns" '{
  "fields": {
    "firstName": { "stringValue": "Jason" },
    "lastName": { "stringValue": "Chen" },
    "preferredName": { "stringValue": "Jay" },
    "birthDate": { "stringValue": "2012-08-22" },
    "gender": { "arrayValue": { "values": [{"stringValue": "Male"}] } },
    "pronouns": { "stringValue": "he/him" }
  }
}'

create_doc "families/${FAMILY1_ID}/campers/${CAMPER2_ID}/private/health?updateMask.fieldPaths=medicalConditions&updateMask.fieldPaths=dietAndFoodAllergies" '{
  "fields": {
    "medicalConditions": { "nullValue": null },
    "dietAndFoodAllergies": { "stringValue": "Vegetarian" }
  }
}'

create_doc "families/${FAMILY1_ID}/campers/${CAMPER2_ID}/private/demographics?updateMask.fieldPaths=born&updateMask.fieldPaths=ethnicity&updateMask.fieldPaths=generation&updateMask.fieldPaths=mandarinLanguage" '{
  "fields": {
    "born": { "stringValue": "USA" },
    "ethnicity": { "arrayValue": { "values": [{"stringValue": "Taiwanese"}, {"stringValue": "Chinese"}] } },
    "generation": { "stringValue": "2nd" },
    "mandarinLanguage": { "stringValue": "Beginner" }
  }
}'
echo "  ✔ Camper: Jason Chen"

REG2_ID="reg-jason-2026"
create_doc "camps/${CAMP_YEAR}/registrations/${REG2_ID}?updateMask.fieldPaths=camperName&updateMask.fieldPaths=camper&updateMask.fieldPaths=campTrack&updateMask.fieldPaths=grade&updateMask.fieldPaths=status&updateMask.fieldPaths=shirtSize&updateMask.fieldPaths=isReturning&updateMask.fieldPaths=isPreRegistered&updateMask.fieldPaths=cabinPreference&updateMask.fieldPaths=familyEmails&updateMask.fieldPaths=createdAt&updateMask.fieldPaths=updatedAt" "{
  \"fields\": {
    \"camperName\": { \"stringValue\": \"Jason Chen\" },
    \"camper\": { \"referenceValue\": \"projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/families/${FAMILY1_ID}/campers/${CAMPER2_ID}\" },
    \"campTrack\": { \"stringValue\": \"Older\" },
    \"grade\": { \"integerValue\": \"8\" },
    \"status\": { \"stringValue\": \"Active\" },
    \"shirtSize\": { \"stringValue\": \"AS\" },
    \"isReturning\": { \"booleanValue\": true },
    \"isPreRegistered\": { \"booleanValue\": false },
    \"cabinPreference\": { \"stringValue\": \"\" },
    \"familyEmails\": { \"arrayValue\": { \"values\": [{\"stringValue\": \"sarah.chen@email.com\"}, {\"stringValue\": \"mike.chen@email.com\"}] } },
    \"createdAt\": { \"timestampValue\": \"2026-03-01T14:00:00Z\" },
    \"updatedAt\": { \"timestampValue\": \"2026-03-01T14:00:00Z\" }
  }
}"
echo "  ✔ Registration: Jason Chen (Active, Older)"

# Link the camper back to its registration (the registration flow does this via arrayUnion)
create_doc "families/${FAMILY1_ID}/campers/${CAMPER2_ID}?updateMask.fieldPaths=registrations" "{
  \"fields\": {
    \"registrations\": { \"arrayValue\": { \"values\": [{\"referenceValue\": \"projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/camps/${CAMP_YEAR}/registrations/${REG2_ID}\"}] } }
  }
}"

# --- Family 2: Lin family with 1 camper (waitlisted) ---
FAMILY2_ID="family-lin-002"

create_doc "families/${FAMILY2_ID}?updateMask.fieldPaths=emails&updateMask.fieldPaths=city&updateMask.fieldPaths=state&updateMask.fieldPaths=zip&updateMask.fieldPaths=street" '{
  "fields": {
    "emails": { "arrayValue": { "values": [{"stringValue": "jenny.lin@email.com"}] } },
    "city": { "stringValue": "San Francisco" },
    "state": { "stringValue": "CA" },
    "zip": { "stringValue": "94110" },
    "street": { "stringValue": "789 Mission St" }
  }
}'
echo "  ✔ Family: Lin"

create_doc "families/${FAMILY2_ID}/parents/jenny.lin@email.com?updateMask.fieldPaths=email&updateMask.fieldPaths=firstName&updateMask.fieldPaths=lastName&updateMask.fieldPaths=phoneNumber" '{
  "fields": {
    "email": { "stringValue": "jenny.lin@email.com" },
    "firstName": { "stringValue": "Jenny" },
    "lastName": { "stringValue": "Lin" },
    "phoneNumber": { "stringValue": "415-555-9876" }
  }
}'

CAMPER3_ID="camper-emily-002"
create_doc "families/${FAMILY2_ID}/campers/${CAMPER3_ID}?updateMask.fieldPaths=firstName&updateMask.fieldPaths=lastName&updateMask.fieldPaths=preferredName&updateMask.fieldPaths=birthDate&updateMask.fieldPaths=gender&updateMask.fieldPaths=pronouns" '{
  "fields": {
    "firstName": { "stringValue": "Emily" },
    "lastName": { "stringValue": "Lin" },
    "preferredName": { "stringValue": "Em" },
    "birthDate": { "stringValue": "2014-11-05" },
    "gender": { "arrayValue": { "values": [{"stringValue": "Female"}] } },
    "pronouns": { "stringValue": "she/they" }
  }
}'

create_doc "families/${FAMILY2_ID}/campers/${CAMPER3_ID}/private/health?updateMask.fieldPaths=medicalConditions&updateMask.fieldPaths=dietAndFoodAllergies" '{
  "fields": {
    "medicalConditions": { "stringValue": "ADHD - takes medication in morning" },
    "dietAndFoodAllergies": { "stringValue": "Gluten-free, dairy-free" }
  }
}'

create_doc "families/${FAMILY2_ID}/campers/${CAMPER3_ID}/private/demographics?updateMask.fieldPaths=born&updateMask.fieldPaths=ethnicity&updateMask.fieldPaths=generation&updateMask.fieldPaths=hokkienLanguage" '{
  "fields": {
    "born": { "stringValue": "USA" },
    "ethnicity": { "arrayValue": { "values": [{"stringValue": "Taiwanese"}] } },
    "generation": { "stringValue": "3rd" },
    "hokkienLanguage": { "stringValue": "None" }
  }
}'
echo "  ✔ Camper: Emily Lin"

REG3_ID="reg-emily-2026"
create_doc "camps/${CAMP_YEAR}/registrations/${REG3_ID}?updateMask.fieldPaths=camperName&updateMask.fieldPaths=camper&updateMask.fieldPaths=campTrack&updateMask.fieldPaths=grade&updateMask.fieldPaths=status&updateMask.fieldPaths=shirtSize&updateMask.fieldPaths=isReturning&updateMask.fieldPaths=isPreRegistered&updateMask.fieldPaths=waitlistTime&updateMask.fieldPaths=familyEmails&updateMask.fieldPaths=createdAt&updateMask.fieldPaths=updatedAt&updateMask.fieldPaths=internalNotes" "{
  \"fields\": {
    \"camperName\": { \"stringValue\": \"Emily Lin\" },
    \"camper\": { \"referenceValue\": \"projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/families/${FAMILY2_ID}/campers/${CAMPER3_ID}\" },
    \"campTrack\": { \"stringValue\": \"Younger\" },
    \"grade\": { \"integerValue\": \"6\" },
    \"status\": { \"stringValue\": \"Waitlist\" },
    \"shirtSize\": { \"stringValue\": \"YL\" },
    \"isReturning\": { \"booleanValue\": false },
    \"isPreRegistered\": { \"booleanValue\": false },
    \"waitlistTime\": { \"timestampValue\": \"2026-03-10T09:15:00Z\" },
    \"familyEmails\": { \"arrayValue\": { \"values\": [{\"stringValue\": \"jenny.lin@email.com\"}] } },
    \"createdAt\": { \"timestampValue\": \"2026-03-10T09:15:00Z\" },
    \"updatedAt\": { \"timestampValue\": \"2026-03-10T09:15:00Z\" },
    \"internalNotes\": { \"stringValue\": \"Cousin of Lily Chen - requested same cabin\" }
  }
}"
echo "  ✔ Registration: Emily Lin (Waitlist, Younger)"

# Link the camper back to its registration (the registration flow does this via arrayUnion)
create_doc "families/${FAMILY2_ID}/campers/${CAMPER3_ID}?updateMask.fieldPaths=registrations" "{
  \"fields\": {
    \"registrations\": { \"arrayValue\": { \"values\": [{\"referenceValue\": \"projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/camps/${CAMP_YEAR}/registrations/${REG3_ID}\"}] } }
  }
}"

# --- Family 3: Wang family with 1 camper (pending payment) ---
FAMILY3_ID="family-wang-003"

create_doc "families/${FAMILY3_ID}?updateMask.fieldPaths=emails&updateMask.fieldPaths=city&updateMask.fieldPaths=state&updateMask.fieldPaths=zip&updateMask.fieldPaths=street" '{
  "fields": {
    "emails": { "arrayValue": { "values": [{"stringValue": "david.wang@email.com"}, {"stringValue": "lisa.wang@email.com"}] } },
    "city": { "stringValue": "Seattle" },
    "state": { "stringValue": "WA" },
    "zip": { "stringValue": "98101" },
    "street": { "stringValue": "123 Pine St" }
  }
}'
echo "  ✔ Family: Wang"

create_doc "families/${FAMILY3_ID}/parents/david.wang@email.com?updateMask.fieldPaths=email&updateMask.fieldPaths=firstName&updateMask.fieldPaths=lastName&updateMask.fieldPaths=phoneNumber" '{
  "fields": {
    "email": { "stringValue": "david.wang@email.com" },
    "firstName": { "stringValue": "David" },
    "lastName": { "stringValue": "Wang" },
    "phoneNumber": { "stringValue": "206-555-4321" }
  }
}'

CAMPER4_ID="camper-kevin-003"
create_doc "families/${FAMILY3_ID}/campers/${CAMPER4_ID}?updateMask.fieldPaths=firstName&updateMask.fieldPaths=lastName&updateMask.fieldPaths=preferredName&updateMask.fieldPaths=birthDate&updateMask.fieldPaths=gender&updateMask.fieldPaths=pronouns" '{
  "fields": {
    "firstName": { "stringValue": "Kevin" },
    "lastName": { "stringValue": "Wang" },
    "preferredName": { "nullValue": null },
    "birthDate": { "stringValue": "2013-06-30" },
    "gender": { "arrayValue": { "values": [{"stringValue": "Male"}] } },
    "pronouns": { "stringValue": "he/him" }
  }
}'

create_doc "families/${FAMILY3_ID}/campers/${CAMPER4_ID}/private/health?updateMask.fieldPaths=medicalConditions&updateMask.fieldPaths=dietAndFoodAllergies" '{
  "fields": {
    "medicalConditions": { "stringValue": "Bee sting allergy (EpiPen), seasonal allergies" },
    "dietAndFoodAllergies": { "nullValue": null }
  }
}'

create_doc "families/${FAMILY3_ID}/campers/${CAMPER4_ID}/private/demographics?updateMask.fieldPaths=born&updateMask.fieldPaths=ethnicity&updateMask.fieldPaths=generation&updateMask.fieldPaths=mandarinLanguage&updateMask.fieldPaths=hakkaLanguage" '{
  "fields": {
    "born": { "stringValue": "Taiwan" },
    "ethnicity": { "arrayValue": { "values": [{"stringValue": "Taiwanese"}, {"stringValue": "Hakka"}] } },
    "generation": { "stringValue": "1.5" },
    "mandarinLanguage": { "stringValue": "Fluent" },
    "hakkaLanguage": { "stringValue": "Conversational" }
  }
}'
echo "  ✔ Camper: Kevin Wang"

REG4_ID="reg-kevin-2026"
create_doc "camps/${CAMP_YEAR}/registrations/${REG4_ID}?updateMask.fieldPaths=camperName&updateMask.fieldPaths=camper&updateMask.fieldPaths=campTrack&updateMask.fieldPaths=grade&updateMask.fieldPaths=status&updateMask.fieldPaths=shirtSize&updateMask.fieldPaths=isReturning&updateMask.fieldPaths=isPreRegistered&updateMask.fieldPaths=familyEmails&updateMask.fieldPaths=createdAt&updateMask.fieldPaths=updatedAt" "{
  \"fields\": {
    \"camperName\": { \"stringValue\": \"Kevin Wang\" },
    \"camper\": { \"referenceValue\": \"projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/families/${FAMILY3_ID}/campers/${CAMPER4_ID}\" },
    \"campTrack\": { \"stringValue\": \"Older\" },
    \"grade\": { \"integerValue\": \"7\" },
    \"status\": { \"stringValue\": \"Pending Payment\" },
    \"shirtSize\": { \"stringValue\": \"AM\" },
    \"isReturning\": { \"booleanValue\": false },
    \"isPreRegistered\": { \"booleanValue\": true },
    \"familyEmails\": { \"arrayValue\": { \"values\": [{\"stringValue\": \"david.wang@email.com\"}, {\"stringValue\": \"lisa.wang@email.com\"}] } },
    \"createdAt\": { \"timestampValue\": \"2026-03-20T16:45:00Z\" },
    \"updatedAt\": { \"timestampValue\": \"2026-03-20T16:45:00Z\" }
  }
}"
echo "  ✔ Registration: Kevin Wang (Pending Payment, Older)"

# Link the camper back to its registration (the registration flow does this via arrayUnion)
create_doc "families/${FAMILY3_ID}/campers/${CAMPER4_ID}?updateMask.fieldPaths=registrations" "{
  \"fields\": {
    \"registrations\": { \"arrayValue\": { \"values\": [{\"referenceValue\": \"projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/camps/${CAMP_YEAR}/registrations/${REG4_ID}\"}] } }
  }
}"

# --- Camp year config ---
create_doc "camps/${CAMP_YEAR}?updateMask.fieldPaths=name&updateMask.fieldPaths=campsite&updateMask.fieldPaths=registrationFee&updateMask.fieldPaths=remainingSpots" '{
  "fields": {
    "name": { "stringValue": "LYF Camp 2026" },
    "campsite": { "stringValue": "Camp Bloomfield" },
    "registrationFee": { "integerValue": "450" },
    "remainingSpots": { "mapValue": { "fields": { "Younger": { "integerValue": "5" }, "Older": { "integerValue": "3" } } } }
  }
}'
echo "  ✔ Camp config: 2026"

echo ""
echo "Done! Seeded 3 families, 4 campers, 4 registrations:"
echo "  - Lily Chen (Active, Younger, grade 5) - has asthma + peanut allergy"
echo "  - Jason Chen (Active, Older, grade 8) - vegetarian"
echo "  - Emily Lin (Waitlist, Younger, grade 6) - ADHD, gluten/dairy-free"
echo "  - Kevin Wang (Pending Payment, Older, grade 7) - bee sting allergy"
