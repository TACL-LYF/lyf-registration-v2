from .utils import parse_timestamp, cast, TIMESTAMP_FORMAT

def parse_camp(row):
  date_format = "%Y-%m-%d"
  return dict(
    id = int(row[0]),
    name = row[1],
    year = int(row[2]),
    # createdAt = parse_timestamp(row[3], TIMESTAMP_FORMAT),
    # updatedAt = parse_timestamp(row[4], TIMESTAMP_FORMAT),
    registrationFee = cast(row[5], float),
    shirtPrice = cast(row[6], float),
    siblingDiscount = cast(row[7], float),
    registrationLateFee = cast(row[8], float),
    registrationOpenDate = parse_timestamp(row[9], date_format),
    registrationLateDate = parse_timestamp(row[10], date_format),
    registrationCloseDate = parse_timestamp(row[11], date_format),
    campStartDate = parse_timestamp(row[12], date_format),
    campEndDate = parse_timestamp(row[13], date_format),
    campsite = row[14],
    campsiteAddress = row[15],
    campSizeCap = cast(row[16], int),
    earlyRegDiscount = cast(row[17], float),
    earlyRegEndDate = parse_timestamp(row[18], date_format),
    preRegistrationFee = cast(row[19], float),
  )
