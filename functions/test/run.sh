export FIRESTORE_EMULATOR_HOST="localhost:8080"

echo "Running emulator firebase tests..."

yarn run build
node addEmulatorData.js
