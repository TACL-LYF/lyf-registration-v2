export GOOGLE_APPLICATION_CREDENTIALS="../lyf-registration-firebase-admin-private-key.json"

echo "Running..."

yarn run build
# node lib/script.js
node lib/registration/addRegistrationScript.js
