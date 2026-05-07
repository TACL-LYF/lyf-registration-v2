import datetime
from .utils import parse_timestamp, parse_bool, cast, DATE_FORMAT

# Grrr we only include these options. I want to include more hence
# why this returns an array. Also storing as a string instead of an enum
# for readability in the database.
def parse_gender(gender):
  if int(gender) == 0:
    return ['Male']
  else:
    return ['Female']

def parse_status(status):
  if int(status) == 0:
    return 'Active'
  else:
    return 'Graduated'


def parse_camper(row):
  try:
    return dict(
      id = int(row[0]),
      firstName = cast(row[1], str),
      lastName = cast(row[2], str),
      birthDate = parse_timestamp(row[3], DATE_FORMAT).strftime("%Y-%m-%d"),
      gender = parse_gender(row[4]),
      email = cast(row[5], str),
      medicalConditions = cast(row[6], str),
      dietAndFoodAllergies = cast(row[7], str),
      # status. Indicated whether they graduated but we don't really need that
      familyId = int(row[9]),
      # createdAt = parse_timestamp(row[10], DATE_FORMAT),
      # updatedAt = parse_timestamp(row[10], DATE_FORMAT),
      returning = parse_bool(row[12])
    )
  except:
    print(f"Unable to process row with ID: {row[0]}")
