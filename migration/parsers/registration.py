import json

from .utils import parse_timestamp, parse_bool, cast, DATE_FORMAT

shirt_size_map = {
  "0": "XS",
  "1": "S",
  "2": "M",
  "3": "L",
  "4": "XL",
  "5": "XXL",
}

def convert_shirt_size(size):
  if size == "" or size == "NULL":
    return None
  return shirt_size_map[size]

status_map = {
  "0": "Active",
  "1": "Cancelled",
  "2": "Waitlist",
  "3": "Pending Payment",
  "4": "Partial Payment",
}

def convert_registration_status(status):
  return status_map[status]

def parse_registrations(row):
  try:
    return dict(
      id = int(row[0]),
      grade = int(row[1]),
      shirtSize = convert_shirt_size(row[2]),
      bus = parse_bool(row[3],),
      additionalNotes = cast(row[4], str),
      waiverSignature = cast(row[5], str),
      waiverDate = parse_timestamp(row[6], DATE_FORMAT),
      group = cast(row[7], int),
      campFamily = cast(row[8], str),
      cabin = cast(row[9], str),
      city = cast(row[10], str),
      state = cast(row[11], str),
      campId = int(row[12]),
      camperId = int(row[13]),
      # created_at = parse_timestamp(row[14], DATE_FORMAT),
      # updated_at = parse_timestamp(row[14], DATE_FORMAT),
      # additional_shirts_old = cast(row[16], int),
      # # registration_payment_id = row[17]
      # # camper_involvment_old = row[18]
      # jtasa_chapter = cast(row[19], str),
      isPreRegistration = parse_bool(row[20]),
      status = convert_registration_status(row[21]),
      additionalShirts = json.loads(row[22]),
      camperInvolvement = json.loads(row[23]),
      # # camp_preference = cast
      covidVaccinated = parse_bool(row[25]),
      internalNotes = cast(row[26], str),
    )
  except:
    print(f"Unable to process row with ID: {row[0]}.")
    return {}
