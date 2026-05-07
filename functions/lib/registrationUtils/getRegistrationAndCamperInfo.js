"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegistrationAndCamperInfo = getRegistrationAndCamperInfo;
/**
 * Helper that gets the registration and camper info from a registration ref
 * @param db
 * @param registrationRef
 * @returns
 */
async function getRegistrationAndCamperInfo(db, registrationRef) {
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
    const healthInfo = healthDoc?.data();
    return {
        camper: camperInfo ?? null,
        camperHealth: healthInfo ?? null,
        registration: registrationInfo,
    };
}
//# sourceMappingURL=getRegistrationAndCamperInfo.js.map