import { Temporal } from "proposal-temporal";

export interface PersonInGroup {
  name: string;
  spouse?: string;
  lastTimeOnSnacks: Temporal.PlainDate;
}

export interface SnackRotation {
  nextSnackDay: Temporal.PlainDate;
  dayOfTheWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  peopleOnSnacks: string[];
  peopleInGroup: PersonInGroup[];
}

export interface Group {
  channelId: string;
  snackRotations: SnackRotation[];
}

const getNumberOfSpotsLeft = <T extends unknown>(
  list: T[],
  countOfSpots: number
): number => countOfSpots - list.length;

export const findNextPeopleForSnacks = (
  people: PersonInGroup[],
  countOfPeopleToFind: number
): PersonInGroup[] => {
  const internalPeople = [...people];
  internalPeople.sort((a, b) =>
    Temporal.PlainDate.compare(a.lastTimeOnSnacks, b.lastTimeOnSnacks)
  );
  return internalPeople.reduce(
    (peopleOnSnacks: PersonInGroup[], person: PersonInGroup) => {
      const spotsLeft = getNumberOfSpotsLeft(
        peopleOnSnacks,
        countOfPeopleToFind
      );
      if (spotsLeft === 0) return peopleOnSnacks;
      if (
        peopleOnSnacks.some(
          (personOnSnacks) => personOnSnacks.name === person.name
        )
      )
        return peopleOnSnacks;
      const spouse: PersonInGroup | undefined = person.spouse
        ? people.find((possibleSpouse) => possibleSpouse.name === person.spouse)
        : undefined;
      if (!spouse) {
        return [...peopleOnSnacks, person];
      }
      if (spotsLeft <= 1) {
        return peopleOnSnacks;
      }
      return [...peopleOnSnacks, person, spouse];
    },
    []
  );
};
