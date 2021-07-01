import { Temporal } from "proposal-temporal";
import {
  deserializePlainDate,
  Group,
  PersonInGroup,
  serializePlainDate,
} from "../types/group";
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
      ownerUserId: "",
      peopleInGroup: [
        { userId: "a", userName: "a" },
        { userId: "b", userName: "b" },
        { userId: "c", userName: "c" },
        { userId: "d", userName: "d" },
      ],
      snackRotations: [
        {
          channelId: "",
          dayOfTheWeek: 1,
          nextSnackDay: serializePlainDate(lastSnackDay),
          peoplePerSnackDay: 2,
          peopleInRotation: [
            { userId: "a", lastTimeOnSnacks: serializePlainDate(lastSnackDay) },
            { userId: "b", lastTimeOnSnacks: serializePlainDate(lastSnackDay) },
            {
              userId: "c",
              lastTimeOnSnacks: serializePlainDate(twoSnackDaysAgo),
            },
            {
              userId: "d",
              lastTimeOnSnacks: serializePlainDate(twoSnackDaysAgo),
            },
          ],
          idsOfPeopleOnSnacks: ["a", "b"],
        },
      ],
    };
    const updatedGroups = internalUpdateRotations([group], today);
    const snackRotation = updatedGroups[0].snackRotations[0];
    expect(snackRotation.nextSnackDay).toStrictEqual(
      serializePlainDate(nextSnackDay)
    );
    expect(snackRotation.idsOfPeopleOnSnacks).toStrictEqual(["c", "d"]);
    const findPerson = (userId: string) =>
      snackRotation.peopleInRotation.find((person) => person.userId === userId);
    expect(findPerson("a")?.lastTimeOnSnacks).toStrictEqual(
      serializePlainDate(lastSnackDay)
    );
    expect(findPerson("b")?.lastTimeOnSnacks).toStrictEqual(
      serializePlainDate(lastSnackDay)
    );
    expect(findPerson("c")?.lastTimeOnSnacks).toStrictEqual(
      serializePlainDate(nextSnackDay)
    );
    expect(findPerson("d")?.lastTimeOnSnacks).toStrictEqual(
      serializePlainDate(nextSnackDay)
    );
  });
});
