import { Temporal } from "proposal-temporal";

interface BasePerson {
  userId: string;
}

interface SerializedPlainDate {
  yn: number;
  mn: number;
  dn: number;
}

export const serializePlainDate = (
  plainDate: Temporal.PlainDate
): SerializedPlainDate => ({
  yn: plainDate.year,
  mn: plainDate.month,
  dn: plainDate.day,
});

export const deserializePlainDate = (
  serializedPlainDate: SerializedPlainDate
): Temporal.PlainDate => {
  return Temporal.PlainDate.from({
    year: serializedPlainDate.yn,
    month: serializedPlainDate.mn,
    day: serializedPlainDate.dn,
  });
};

export interface PersonInGroup extends BasePerson {
  userName: string;
  spouseUserId?: string;
}

export interface PersonInRotation extends BasePerson {
  lastTimeOnSnacks: SerializedPlainDate;
}

export interface SnackRotation {
  channelId: string;
  nextSnackDay: SerializedPlainDate;
  dayOfTheWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  peoplePerSnackDay: number;
  idsOfPeopleOnSnacks: string[];
  peopleInRotation: PersonInRotation[];
}

export interface Group {
  groupId: string;
  ownerUserId: string;
  snackRotations: SnackRotation[];
  peopleInGroup: PersonInGroup[];
}

const getNumberOfSpotsLeft = <T extends unknown>(
  list: T[],
  countOfSpots: number
): number => countOfSpots - list.length;

export const findNextPeopleForSnacks = (
  peopleInGroup: PersonInGroup[],
  peopleInRotation: PersonInRotation[],
  countOfPeopleToFind: number
): PersonInRotation[] => {
  const internalPeopleInRotation = [...peopleInRotation];
  internalPeopleInRotation.sort((a, b) =>
    Temporal.PlainDate.compare(
      deserializePlainDate(a.lastTimeOnSnacks),
      deserializePlainDate(b.lastTimeOnSnacks)
    )
  );
  return internalPeopleInRotation.reduce(
    (
      peopleOnSnacks: PersonInRotation[],
      personInRotation: PersonInRotation
    ) => {
      const spotsLeft = getNumberOfSpotsLeft(
        peopleOnSnacks,
        countOfPeopleToFind
      );
      if (spotsLeft === 0) return peopleOnSnacks;
      const isPersonAlreadyOnSnacks = peopleOnSnacks.some(
        (personOnSnacks) => personOnSnacks.userId === personInRotation.userId
      );
      if (isPersonAlreadyOnSnacks) return peopleOnSnacks;
      const getPersonInGroup = <T extends BasePerson>(
        person: T
      ): PersonInGroup | undefined =>
        peopleInGroup.find(
          (personInGroup) => personInGroup.userId === person.userId
        );
      const personInGroup = getPersonInGroup(personInRotation);
      if (!personInGroup) {
        console.log(`Nobody with userId: ${personInRotation.userId}`);
        return peopleOnSnacks;
      }
      const spouse: PersonInRotation | undefined = personInGroup.spouseUserId
        ? peopleInRotation.find(
            (possibleSpouseInRotation) =>
              possibleSpouseInRotation.userId === personInGroup.spouseUserId
          )
        : undefined;
      if (!spouse) return [...peopleOnSnacks, personInRotation];
      if (spotsLeft <= 1) return peopleOnSnacks;
      return [...peopleOnSnacks, personInRotation, spouse];
    },
    []
  );
};
