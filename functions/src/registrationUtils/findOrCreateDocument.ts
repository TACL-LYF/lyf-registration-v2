import {
  DocumentReference,
  FieldValue,
  Firestore,
} from "firebase-admin/firestore";
import {logger} from "firebase-functions";

// Local imports
import {
  CampYear,
  Camper,
  Family,
  Parent,
  Registration,
} from "lyf-registration-schemas";

type RefAndExisting<T> = {
  ref: DocumentReference<T>;
  didExist: boolean;
};

/**
 * Given emails, find the familiy that has at least one match.
 * @param db The firestore database to query from.
 * @param emails
 */
export async function findOrCreateFamily(
  db: Firestore,
  emails: string[]
): Promise<DocumentReference<Family>> {
  const familiesQuery = await db
    .collection("families")
    .where("emails", "array-contains-any", emails)
    .get();
  if (familiesQuery.size > 1) {
    const err = `More than one family found containing emails: ${emails.join(
      ", "
    )}`;
    logger.error(err);
    throw err;
  }

  return familiesQuery.size == 1
    ? familiesQuery.docs[0].ref
    : db.collection("families").doc();
}

/**
 * Given a parent object and an existing family ref, try to
 * @param familyRef The document reference for a new or existing family
 * @param parent The parent object to get data from.
 */
export async function findOrCreateParent(
  familyRef: DocumentReference<Family>,
  parent: Parent
): Promise<DocumentReference<Parent>> {
  const parentName = `${parent?.firstName} ${parent?.lastName}`;
  if (!parent.email) {
    logger.warn(`No email found with parent: ${parentName}`);
  }

  const parentId = parent.email?.toLowerCase() ?? parent.phoneNumber;

  if (!parentId) {
    const errMsg = `No email or phone number found on the parent ${parentName}`;
    logger.error(errMsg);
    throw new Error(errMsg);
  }

  return familyRef.collection("parents").doc(parentId);
}

/**
 * Given a family and a camper object, either find an existing camper using the ID or name
 * or create a new one
 * @param familyRef The family that this camper is associated with.
 * @param camper The camper data object
 * @returns The camper document reference
 */
export async function findOrCreateCamper(
  familyRef: DocumentReference<Family>,
  camper: Camper
): Promise<DocumentReference<Camper>> {
  const campersInFamilyRef = familyRef.collection("campers");

  if (camper.id) {
    // TODO Check for existence of the camper
    return campersInFamilyRef.doc(camper.id);
  }

  const campersInFamilyQuery = await campersInFamilyRef
    .where("firstName", "==", camper?.firstName)
    .get();

  return campersInFamilyQuery.size == 1
    ? campersInFamilyQuery.docs[0].ref
    : campersInFamilyRef.doc();
}

/**
 * Find or create a new registration for the camper and camp year
 * @param camperRef The camper this registration is associated with
 * @param campRef The document referencing the curren't camp year
 * @returns The registration document reference
 */
export async function findOrCreateRegistration(
  camperRef: DocumentReference<Camper>,
  campRef: DocumentReference<CampYear>
): Promise<RefAndExisting<Registration>> {
  const camperData = (await camperRef.get()).data() as Camper;

  // Each registration's parent is a collection and the collection's parent is a document whose ID is the camp year
  const regRef = camperData?.registrations?.find(
    (regRef) => regRef.parent.parent?.id === campRef.id
  ) as DocumentReference<Registration> | undefined;

  if (regRef) {
    return {
      ref: regRef,
      didExist: true,
    };
  }

  const newRegRef = campRef
    .collection("registrations")
    .doc() as DocumentReference<Registration>;

  await newRegRef.set({
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    isTestData: camperData.isTestData ?? false,
  });

  return {
    ref: newRegRef,
    didExist: false,
  };
}
