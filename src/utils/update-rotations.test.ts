import { Temporal } from "proposal-temporal";
import { Group, serializePlainDate } from "../types/group";
import { internalUpdateRotations } from "./update-rotations";

const exampleGroup: Group = {
  groupId: "T01FE3QACV7",
  ownerUserId: "U01K1TT33T2",
  peopleInGroup: [
    { userId: "U01K1TT33T2", userName: "alexjamesmalcolm" },
    { userId: "U01F1NR0WSX", userName: "b.hill1053" },
    { userId: "U01F1RHG10D", userName: "wheelercaroline073" },
    { userId: "U01FQVCGAE7", userName: "mollyj.malone09" },
    { userId: "U01FR9YLB3J", userName: "samknight614" },
    {
      userId: "U01FASLSP2T",
      userName: "care.maxwell",
      spouseUserId: "U01JKDM1W8L",
    },
    { userId: "U01JC2TU7NE", userName: "sdevine.1" },
    {
      userId: "U01JKDM1W8L",
      userName: "marchese.dem",
      spouseUserId: "U01FASLSP2T",
    },
    { userId: "U01JC8RDYDR", userName: "lmitchell.2" },
    { userId: "U01FMPB596H", userName: "branaghan.sarah" },
    { userId: "U01GH7LV2MS", userName: "andrea.hesse91" },
    { userId: "U01JC3CU0KU", userName: "et93093" },
    { userId: "U01FJ1T4GQN", userName: "mara.kate.miller" },
    { userId: "U01JD1MT8KV", userName: "sicquan13" },
    { userId: "U01JQMVHXBK", userName: "deon.goins1015" },
    { userId: "U01FSJSFHQQ", userName: "serena.ann.caldarella" },
  ],
  snackRotations: [
    {
      channelId: "C01EUNVACTG",
      dayOfTheWeek: 1,
      nextSnackDay: {
        yn: 2021,
        mn: 7,
        dn: 12,
      },
      peoplePerSnackDay: 3,
      idsOfPeopleOnSnacks: ["U01K1TT33T2", "U01F1NR0WSX", "U01F1RHG10D"],
      peopleInRotation: [
        {
          userId: "U01K1TT33T2",
          lastTimeOnSnacks: {
            yn: 2021,
            mn: 7,
            dn: 12,
          },
        },
        {
          userId: "U01F1NR0WSX",
          lastTimeOnSnacks: {
            yn: 2021,
            mn: 7,
            dn: 12,
          },
        },
        {
          userId: "U01F1RHG10D",
          lastTimeOnSnacks: {
            yn: 2021,
            mn: 7,
            dn: 12,
          },
        },
        {
          userId: "U01FQVCGAE7",
          lastTimeOnSnacks: {
            yn: 1,
            mn: 1,
            dn: 1,
          },
        },
        {
          userId: "U01FR9YLB3J",
          lastTimeOnSnacks: {
            yn: 1,
            mn: 1,
            dn: 1,
          },
        },
        {
          userId: "U01FASLSP2T",
          lastTimeOnSnacks: {
            yn: 1,
            mn: 1,
            dn: 1,
          },
        },
        {
          userId: "U01JC2TU7NE",
          lastTimeOnSnacks: {
            yn: 1,
            mn: 1,
            dn: 1,
          },
        },
        {
          userId: "U01JKDM1W8L",
          lastTimeOnSnacks: {
            yn: 1,
            mn: 1,
            dn: 1,
          },
        },
        {
          userId: "U01JC8RDYDR",
          lastTimeOnSnacks: {
            yn: 1,
            mn: 1,
            dn: 1,
          },
        },
        {
          userId: "U01FMPB596H",
          lastTimeOnSnacks: {
            yn: 1,
            mn: 1,
            dn: 1,
          },
        },
        {
          userId: "U01GH7LV2MS",
          lastTimeOnSnacks: {
            yn: 1,
            mn: 1,
            dn: 1,
          },
        },
        {
          userId: "U01JC3CU0KU",
          lastTimeOnSnacks: {
            yn: 1,
            mn: 1,
            dn: 1,
          },
        },
        {
          userId: "U01FJ1T4GQN",
          lastTimeOnSnacks: {
            yn: 1,
            mn: 1,
            dn: 1,
          },
        },
        {
          userId: "U01JD1MT8KV",
          lastTimeOnSnacks: {
            yn: 1,
            mn: 1,
            dn: 1,
          },
        },
        {
          userId: "U01JQMVHXBK",
          lastTimeOnSnacks: {
            yn: 1,
            mn: 1,
            dn: 1,
          },
        },
        {
          userId: "U01FSJSFHQQ",
          lastTimeOnSnacks: {
            yn: 1,
            mn: 1,
            dn: 1,
          },
        },
      ],
    },
  ],
};

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

  it("should not update group if the snack day is in the future", () => {
    const result = internalUpdateRotations(
      [exampleGroup],
      Temporal.PlainDate.from({ year: 2021, month: 7, day: 11 })
    );
    expect(result.length).toBe(0);
  });
  it("should not update group if the snack day is today", () => {
    const result = internalUpdateRotations(
      [exampleGroup],
      Temporal.PlainDate.from({ year: 2021, month: 7, day: 12 })
    );
    expect(result.length).toBe(0);
  });
  it("should update group if the snack day is yesterday", () => {
    const result = internalUpdateRotations(
      [exampleGroup],
      Temporal.PlainDate.from({ year: 2021, month: 7, day: 13 })
    );
    expect(result.length).toBe(1);
  });
  it("should update group if the snack day is today but the next snack date should be the same day", () => {
    const today = Temporal.PlainDate.from({ year: 2021, month: 7, day: 19 });
    const result = internalUpdateRotations([exampleGroup], today);
    expect(result.length).toBe(1);
    expect(result[0].snackRotations[0].nextSnackDay).toBe(
      serializePlainDate(today)
    );
  });
});
