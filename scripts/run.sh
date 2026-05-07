#!/bin/bash

# Add the path to the private key that enables the Admin SDK
export GOOGLE_APPLICATION_CREDENTIALS="../lyf-registration-firebase-admin-private-key.json"
unset FIRESTORE_EMULATOR_HOST

echo "Running firebase script..."

script_name=""

while getopts ":t:n:h" option; do
  case $option in
    t)
      # firebase emulators:start
      # export FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
      echo "Test mode is broken right now oops"
      ;;
    n)
      script_name="$OPTARG"
      ;;
    h|\?)
      echo "Usage: $0 [-t] [-n name]"
      exit 0
      ;;
  esac
done
# Build the TypeScript files
yarn run build

# Run the script in the lib directory
node lib/"$script_name".js
