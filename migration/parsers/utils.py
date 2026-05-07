from datetime import datetime

TIMESTAMP_FORMAT = "%Y-%m-%d %H:%M:%S.%f"
DATE_FORMAT = "%m/%d/%Y"

def parse_timestamp(str, format):
  return datetime.strptime(str, format) if str != "" and str != "NULL" else None

def parse_bool(str):
  return True if str == "TRUE" else False

def cast(str, type):
  return type(str) if str != "" and str != "NULL" else None
