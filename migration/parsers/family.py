from .utils import parse_timestamp, parse_bool, cast, DATE_FORMAT, TIMESTAMP_FORMAT

# I want to store parents as an array of parent so that we can
# more easily associate families with parents on the registration form.
# For example, if the primary parent switches one year I don't want to create a whole new family.
def parse_parents(row):
  parents = []
  parents.append(dict(
    firstName = row[1],
    lastName = row[2],
    email = row[3],
    phoneNumber = row[4],
    lineId = cast(row[16], str),
    subscribeToMailingList = parse_bool(row[18])
  ))

  if row[5] != "" and row[5] != "NULL":
    parents.append(dict(
      firstName = row[5],
      lastName = cast(row[6], str),
      email = cast(row[7], str),
      phoneNumber = cast(row[8], str),
      lineId = cast(row[17], str),
      subscribeToMailingList = parse_bool(row[19])
    ))
  return parents

def parse_family(row):
  try:
    return dict(
      id = int(row[0]),
      parents = parse_parents(row), # An array of parents
      suite = cast(row[9], str),
      street = cast(row[10], str),
      city = cast(row[11], str),
      state = cast(row[12], str),
      zip = cast(row[13], str),
    )
  except:
    print(f"Unable to process row with ID: {row[0]}")
