import json
from .utils import parse_timestamp, cast, TIMESTAMP_FORMAT

def parse_breakdown(breakdown_str):
  # print(breakdown["campers"])
  return []

# We want to link each registration payment to a registration.
def parse_registration_payment(row):
  breakdown = json.loads(row[10])
  campers = []
  for c in breakdown.get("campers", []):
    campers.append(c["name"])

  try:
    return dict(
      id = int(row[0]),
      total = cast(row[1], float),
      additionalDonation = cast(row[2], float),
      discountCode = cast(row[3], str),
      stripeCardId = cast(row[4], str),
      # breakdown_old
      createdAt = parse_timestamp(row[6], TIMESTAMP_FORMAT),
      updatedAt = parse_timestamp(row[7], TIMESTAMP_FORMAT),
      cardBrand = cast(row[8], str),
      # # stripe_last_four_integer
      campers = campers,
      # stripe_last_four = cast(row[11], str),
      # # payment_type
      # # check_number
      # # paid
      # # payment_token
      subtotal = cast(row[16], float),

      # Need to include these later so that we link the payment to a registration.
      registrations = [],
      breakdown = breakdown,
    )
  except:
    print(f"Unable to process payment with ID: {row[0]}")
