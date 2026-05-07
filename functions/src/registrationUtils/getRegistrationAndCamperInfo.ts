import {DocumentReference, Firestore} from "firebase-admin/firestore";
import {Camper, CamperHealth, Registration} from "lyf-registration-schemas";

/**
 * Helper that gets the registration and camper info from a registration ref
 * @param db
 * @param registrationRef
 * @returns
 */
export async function getRegistrationAndCamperInfo(
  db: Firestore,
  registrationRef: DocumentReference<Registration>
): Promise<{
  camper: Camper | null;
  camperHealth: CamperHealth | null;
  registration: Registration | null;
}> {
  const registration = await registrationRef.get();
  const registrationInfo = registration.data();
  if (!registrationInfo) {
    return {
      camper: null,
      camperHealth: null,
      registration: null,
    };
  }

  const camperRef = registrationInfo?.camper;
  if (!camperRef) {
    return {
      camper: null,
      camperHealth: null,
      registration: registrationInfo,
    };
  }

  const camper = await db.doc(camperRef.path).get();
  const camperInfo = camper?.data();

  const healthDoc = await db
    .doc(`${camperRef.path}/private/health`)
    .get();
  const healthInfo = healthDoc?.data() as CamperHealth | undefined;

  return {
    camper: camperInfo ?? null,
    camperHealth: healthInfo ?? null,
    registration: registrationInfo,
  };
}
