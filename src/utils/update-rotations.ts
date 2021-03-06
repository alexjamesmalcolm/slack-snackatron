import { Temporal } from "proposal-temporal";
import { connect } from "../mongodb";
import {
  Group,
  findNextPeopleForSnacks,
  SnackRotation,
  PersonInRotation,
  serializePlainDate,
  deserializePlainDate,
} from "../types/group";
import { getNextDayOfWeekIncludingToday } from "../types/day-of-the-week";

export const internalUpdateRotations = (
  groups: Group[],
  today = Temporal.now.plainDateISO()
): Group[] =>
  groups
    .filter((group) =>
      group.snackRotations.some(
        (rotation) =>
          Temporal.PlainDate.compare(
            deserializePlainDate(rotation.nextSnackDay),
            today
          ) < 0
      )
    )
    .map((group) => {
      return {
        ...group,
        snackRotations: group.snackRotations.map((rotation): SnackRotation => {
          const nextPeopleForSnacks = findNextPeopleForSnacks(
            group.peopleInGroup,
            rotation.peopleInRotation,
            rotation.peoplePerSnackDay
          );
          const nextSnackDay = getNextDayOfWeekIncludingToday(
            rotation.dayOfTheWeek,
            today
          );
          return {
            ...rotation,
            nextSnackDay: serializePlainDate(nextSnackDay),
            idsOfPeopleOnSnacks: nextPeopleForSnacks.map(
              (person) => person.userId
            ),
            peopleInRotation: rotation.peopleInRotation.map(
              (person): PersonInRotation => {
                if (
                  nextPeopleForSnacks.some(
                    (nextPerson) => person.userId === nextPerson.userId
                  )
                )
                  return {
                    ...person,
                    lastTimeOnSnacks: serializePlainDate(nextSnackDay),
                  };
                return person;
              }
            ),
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
