import { Pairings } from "@/pairing/Pairings";
import { UNASSIGNED_GROUP_ID } from "@/utils";
test("Single camper into unassigned group", () => {
    const campers = [
        {
            id: "1",
            name: "Camper 1",
        },
    ];
    const groups = [];
    const pairings = new Pairings(groups, campers);
    expect(pairings.groups).toHaveLength(1);
    expect(pairings.groups[0].id).toBe(UNASSIGNED_GROUP_ID);
    expect(pairings.groups[0].members.size).toBe(1);
});
test("Assign single camper to group", () => {
    const camper1 = {
        id: "1",
        name: "Camper 1",
    };
    const campers = [camper1];
    const groupA = {
        id: "A",
        members: new Set(),
        minSize: 0,
        maxSize: 10,
    };
    const groups = [groupA];
    const pairings = new Pairings(groups, campers);
    expect(pairings.groups).toHaveLength(2);
    // First assignment is to the unassigned group
    const unassignedGroup = pairings.getGroup(UNASSIGNED_GROUP_ID);
    expect(unassignedGroup.members.has(camper1)).toBe(true);
    // Assign camper to group
    pairings.assignCamperToGroup(campers[0], groups[0]);
    expect(groupA.members.has(camper1)).toBe(true);
    expect(unassignedGroup.members.has(camper1)).toBe(false);
});
//# sourceMappingURL=Pairings.test.js.map