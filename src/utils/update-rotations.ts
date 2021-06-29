import { Temporal } from "proposal-temporal";
import { connect } from "../mongodb";
import { Group, findNextPeopleForSnacks } from "../types/group";
import { getNextDayOfWeek } from "../types/day-of-the-week";

export const internalUpdateRotations = (
  groups: Group[],
  today = Temporal.now.plainDateISO()
): Group[] =>
  groups
    .filter((group) =>
      group.snackRotations.some((rotation) =>
        Temporal.PlainDate.compare(rotation.nextSnackDay, today)
      )
    )
    .map((group) => {
      return {
        ...group,
        snackRotations: group.snackRotations.map((rotation) => {
          const nextPeopleForSnacks = findNextPeopleForSnacks(
            rotation.peopleInGroup,
            rotation.peoplePerSnackDay
          );
          const nextSnackDay = getNextDayOfWeek(rotation.dayOfTheWeek, today);
          return {
            ...rotation,
            nextSnackDay,
            peopleOnSnacks: nextPeopleForSnacks.map((person) => person.name),
            peopleInGroup: rotation.peopleInGroup.map((person) => {
              if (
                nextPeopleForSnacks.some(
                  (nextPerson) => person.name === nextPerson.name
                )
              ) {
                return { ...person, lastTimeOnSnacks: nextSnackDay };
              }
              return person;
            }),
          };
        }),
      };
    });

export const updateRotations = async (groupId?: string): Promise<void> => {
  const [mongo, close] = await connect();
  const collectionOfGroups = mongo.collection<Group>("groups");
  const getGroups = async (): Promise<Group[]> => {
    if (groupId) {
      const group = await collectionOfGroups.findOne(
        { groupId },
        { timeout: true }
      );
      if (group) return [group];
      return [];
    } else {
      return await collectionOfGroups.find({}).toArray();
    }
  };
  const updatedGroups = await getGroups()
    .then(internalUpdateRotations)
    .catch((e) => {
      console.error(e);
      return [] as Group[];
    });
  for (const updatedGroup of updatedGroups) {
    await collectionOfGroups.updateOne(
      { groupId: updatedGroup.groupId },
      { $set: updatedGroup }
    );
  }
  await close();
};
