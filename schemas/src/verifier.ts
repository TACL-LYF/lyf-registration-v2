// A set of types that allow us to create verifier/required functions that guarantee
// we have all the required fields for a given type.

import { Registration } from "./camp";
import { Camper } from "./families";

export type RequiredFieldsResult<T> =
  | (T & { hasAllFields: true })
  | {
      hasAllFields: false;
      //   The keys of the missing fields
      missingFieldKeys: string[];
      // A user friendly string representation of the missing fields
      missingFields: string[];
    };

export function isEmptyStringOrNullish(
  str: string | null | undefined
): boolean {
  return !str || str === "";
}

// Get the required fields that the server expects should be present on the payload from the client.
export function getClientRequiredCamperFields(
  camper: Camper
): RequiredFieldsResult<{
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string[];
}> {
  const { firstName, lastName, birthDate, gender } = camper;

  const missingFieldKeys: string[] = [];
  const missingFields: string[] = [];

  if (isEmptyStringOrNullish(firstName)) {
    missingFieldKeys.push("firstName");
    missingFields.push("first name");
  }

  if (isEmptyStringOrNullish(lastName)) {
    missingFieldKeys.push("lastName");
    missingFields.push("last name");
  }

  if (isEmptyStringOrNullish(birthDate)) {
    missingFieldKeys.push("birthDate");
    missingFields.push("birthday");
  }

  if (!gender || gender.length === 0) {
    missingFieldKeys.push("gender");
    missingFields.push("gender");
  }

  return missingFieldKeys.length > 0
    ? { hasAllFields: false, missingFieldKeys, missingFields }
    : {
        hasAllFields: true,
        firstName: firstName!,
        lastName: lastName!,
        birthDate: birthDate!,
        gender: gender!,
      };
}

// Get the required fields that the server expects should be present on the payload from the client.
export function getClientRequiredRegistrationFields(
  registration: Registration
): RequiredFieldsResult<{
  grade: number;
  shirtSize: string;
}> {
  const { grade, shirtSize } = registration;

  const missingFieldKeys: string[] = [];
  const missingFields: string[] = [];

  if (!grade) {
    missingFieldKeys.push("grade");
    missingFields.push("grade");
  }

  if (isEmptyStringOrNullish(shirtSize)) {
    missingFieldKeys.push("shirtSize");
    missingFields.push("shirt size");
  }

  return missingFields.length > 0
    ? { hasAllFields: false, missingFieldKeys, missingFields }
    : {
        hasAllFields: true,
        grade: grade!,
        shirtSize: shirtSize!,
      };
}
