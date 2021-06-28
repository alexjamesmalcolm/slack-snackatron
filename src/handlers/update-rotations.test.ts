import { Temporal } from "proposal-temporal";
import { Group, PersonInGroup } from "../types/group";
import { internalUpdateRotations } from "./update-rotations";

describe("internalUpdateRotations", () => {
  it("should", () => {
    const twoSnackDaysAgo = Temporal.PlainDate.from({
      year: 2010,
      month: 1,
      day: 4,
    });
    const lastSnackDay = Temporal.PlainDate.from({
      year: 2010,
      month: 1,
      day: 11,
    });
    const today = Temporal.PlainDate.from({ year: 2010, month: 1, day: 12 });
    const nextSnackDay = Temporal.PlainDate.from({
      year: 2010,
      month: 1,
      day: 18,
    });
    const group: Group = {
      groupId: "",
      ownerUsername: "",
      snackRotations: [
        {
          channelId: "",
          dayOfTheWeek: 1,
          nextSnackDay: lastSnackDay,
          peoplePerSnackDay: 2,
          peopleInGroup: [
            { name: "a", lastTimeOnSnacks: lastSnackDay },
            { name: "b", lastTimeOnSnacks: lastSnackDay },
            { name: "c", lastTimeOnSnacks: twoSnackDaysAgo },
            { name: "d", lastTimeOnSnacks: twoSnackDaysAgo },
          ],
          peopleOnSnacks: ["a", "b"],
        },
      ],
    };
    const updatedGroups = internalUpdateRotations([group], today);
    const snackRotation = updatedGroups[0].snackRotations[0];
    expect(snackRotation.nextSnackDay).toStrictEqual(nextSnackDay);
    expect(snackRotation.peopleOnSnacks).toStrictEqual(["c", "d"]);
    const findPerson = (name: string) =>
      snackRotation.peopleInGroup.find((person) => person.name === name);
    expect(findPerson("a")?.lastTimeOnSnacks.toString()).toBe(
      lastSnackDay.toString()
    );
    expect(findPerson("b")?.lastTimeOnSnacks.toString()).toBe(
      lastSnackDay.toString()
    );
    expect(findPerson("c")?.lastTimeOnSnacks.toString()).toBe(
      nextSnackDay.toString()
    );
    expect(findPerson("d")?.lastTimeOnSnacks.toString()).toBe(
      nextSnackDay.toString()
    );
  });
});
