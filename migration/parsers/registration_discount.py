# This file contains both the registration_discount AND camp_credit
# parsing because I want to combine the two.

from .utils import cast, parse_timestamp, parse_bool, TIMESTAMP_FORMAT

def parse_discount_type(discount_type):
  if int(discount_type) == 1:
    return "Percent"
  else:
    return "Fixed Amount"

  # For the most part we're going to ignore registration_discounts actually
def parse_registration_discounts(row):
  try:
    return dict(
      id = cast(row[0], int),
      code = cast(row[1], str),
      discountAmount = cast(row[2], float),
      redeemed = parse_bool(row[3]),
      # camp_id not necessary
      familyId = None,
      registrationPaymentId = cast(row[5], int),
      # createdAt = parse_timestamp(row[6], TIMESTAMP_FORMAT),
      # updatedAt = parse_timestamp(row[7], TIMESTAMP_FORMAT),
      discountType = parse_discount_type(row[8]),
      description = cast(row[9], str)
    )
  except:
    print(f"Unable to process registration_discount with ID: {row[0]}")

# Trying to force a camp credit into a registration_discount
def parse_camp_credit(row):
  try:
    return dict(
      id = int(row[0]),
      code = None,
      familyId = cast(row[1], int),
      status = "Not Yet Redeemed" if row[2] == "0" else "Fully Redeemed", # We only have these right now
      totalAmount = cast(row[3], float),
      remainingAmount = cast(row[4], float),
      description = cast(row[5], str),
      # created_at = parse_timestamp(row[6], TIMESTAMP_FORMAT),
      # updated_at = parse_timestamp(row[7], TIMESTAMP_FORMAT),
    )
  except:
    print(f"Unable to process camp_credit with ID: {row[0]}")
