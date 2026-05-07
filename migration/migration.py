import os
import csv
import sys
import argparse
import firebase_admin
import json

from datetime import datetime

from firebase_admin import firestore
from firebase_admin import credentials

# Parsers
from parsers.camp import parse_camp
from parsers.camper import parse_camper
from parsers.family import parse_family
from parsers.registration import parse_registrations
from parsers.registration_discount import parse_camp_credit
from parsers.registration_payment import parse_registration_payment

# Timestamp Formats
METADATA_FORMAT = "%Y-%m-%d %H:%M:%S.%f"

# Credential File Name
CRED_FILE = "lyf-registration-firebase-admin-private-key.json"

# CSV File Names
DATA_DIR = "data"

CAMPS_FILE = os.path.join(DATA_DIR, "camps.csv")
REGISTRATION_FILE = os.path.join(DATA_DIR, "registrations.csv")
CAMP_CREDITS_FILE = os.path.join(DATA_DIR, "camp_credits.csv")
PAYMENTS_FILE = os.path.join(DATA_DIR, "registration_payments.csv")

FAMILIES_FILE = os.path.join(DATA_DIR, "families.csv")
CAMPERS_FILE = os.path.join(DATA_DIR, "campers.csv")

REFERRALS_FILE = os.path.join(DATA_DIR, "referrals.csv")
REFERRAL_METHODS_FILE = os.path.join(DATA_DIR, "referral_methods.csv")

def print_verbose(verbose, string):
  if verbose:
    print(string)

def get_csv(filename, parser):
  # Data will be a list of dictionaries.
  data = []
  with open(filename) as f:
    reader = csv.reader(f)

    # Skip the first line of the CSV to remove the header.
    header_row = next(reader)
    expected_columns = len(header_row)

    # Next read the rest of the data and parse it using the passed in parser.
    data_row = []
    for row in reader:
      if len(row) < expected_columns:
        if len(data_row) == 0:
          # If there's nothing in the data_row then we just append the first value.
          data_row.append(row[0])
        else:
          # Otherwise, it's part of the previous column and we should combine the values.
          data_row[-1] += f"\n{row[0]}"

        # Extend the existing data_row with the rest of the currently parsed row
        data_row.extend(row[1:])
      else:
        data_row = row

      if len(data_row) == expected_columns:
        data.append(parser(data_row))

  return data

def main(use_firebase, verbose):
  # Initialize Firebase Cloudstore with an authenticated private key.
  if use_firebase:
    cred = credentials.Certificate(CRED_FILE)
    app = firebase_admin.initialize_app(cred)
    db = firestore.client()
    batch = db.batch()

  # Parse through the camps
  print_verbose(verbose, "********Parsing through the camps********")
  camp_data = get_csv(CAMPS_FILE, parse_camp)
  camp_mapping = [None] * (len(camp_data) + 1)
  for camp in camp_data:
    camp_id = camp.pop("id")
    if use_firebase:
      camp_ref = db.collection("camps").document(str(camp["year"]))
      camp_mapping[camp_id] = camp_ref
      batch.set(camp_ref, camp)
    else:
      camp_mapping[camp_id] = True

  # Commit the camps
  if use_firebase:
    batch.commit()

  # Parse through the families.
  print_verbose(verbose, "********Parsing through the families********")
  family_data = get_csv(FAMILIES_FILE, parse_family)
  family_mapping = {}
  for family in family_data:
    family_id = family.pop("id")

    # Add roles to the document for security rules.
    emails = []
    parents = family.pop("parents")
    for parent in parents:
      email = parent.get("email")
      if email is not None:
        emails.append(email)
    family["emails"] = emails

    # Commit to firebase
    if use_firebase:
      update_time, family_ref = db.collection("families").add(family)
      family_mapping[family_id] = family_ref

      for parent in parents:
        parent_id = parent.get("email", parent.get("firstName"))
        if parent_id is not None:
          family_ref.collection("parents").document(parent_id).set(parent)
    else:
      family_mapping[family_id] = True


  # Parse through the campers
  print_verbose(verbose, "********Parsing through the campers********")
  camper_data = get_csv(CAMPERS_FILE, parse_camper)
  camper_mapping = {}
  for camper in camper_data:
    camper_id = camper.pop("id")
    family_id = camper.pop("familyId")
    if use_firebase:
      family = family_mapping[family_id]
      update_time, camper_ref = family.collection("campers").add(camper)
      camper_mapping[camper_id] = camper_ref
    else:
      if family_mapping[family_id] is None:
        print(f"No family found with id: {family_id} for camper id: {camper_id}")
      camper_mapping[camper_id] = True

  # Parse through the Registrations and convert the IDs into Firebase IDs
  print_verbose(verbose, "********Parsing through the registrations********")
  registration_data = get_csv(REGISTRATION_FILE, parse_registrations)
  registration_mapping = {}
  for registration in registration_data:
    registration_id = registration.pop("id")
    camp_id = registration.pop("campId")
    camper_id = registration.pop("camperId")

    if use_firebase:
      camp = camp_mapping[camp_id]
      registration["camper"] = camper_mapping[camper_id]
      update_time,  registration_ref = camp.collection("registrations").add(registration)
      registration_mapping[registration_id] = registration_ref
    else:
      if camp_mapping[camp_id] is None:
        print(f"No camp found with id: {camp_id} for registration id: {registration_id}")
      if camper_mapping[camper_id] is None:
        print(f"No camper found with id: {camper_id} for registration id: {registration_id}")
      registration_mapping[registration_id] = True

  # Parse through the registration discounts. We'll combine the camp credits and the registration
  # discounts into one table.
  print_verbose(verbose, "********Parsing through the camp credits/discounts********")
  discount_data = get_csv(CAMP_CREDITS_FILE, parse_camp_credit)
  discount_mapping = {}
  for discount in discount_data:
    discount_id = discount.pop("id")
    family_id = discount.pop("familyId")

    if use_firebase:
      family = family_mapping[family_id]
      discount["family"] = family
      update_time, discount_ref = db.collection("credits").add(discount)
    else:
      if family_mapping[family_id] is None:
        print(f"No family found with id: {family_id} for discount id: {discount_id}")
      discount_mapping[discount_id] = True

  # Parse through the registration payments
  print_verbose(verbose, "********Parsing through the payments********")
  payment_data = get_csv(PAYMENTS_FILE, parse_registration_payment)
  for payment in payment_data:
    payment_id = payment.pop("id")

    if use_firebase:
      update_time, payment_ref = db.collection("legacy-payments").add(payment)

  print_verbose(verbose, "Finished")

if __name__ == "__main__":
  parser = argparse.ArgumentParser(description="Migrate CSV files into Firestore")
  parser.add_argument("-c", "--commit", action="store_true", default=False)
  parser.add_argument("-v", "--verbose", action="store_true", default=False)

  args = parser.parse_args()
  main(args.commit, args.verbose)
