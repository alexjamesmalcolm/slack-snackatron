import { Temporal } from "proposal-temporal";
import {
  DayOfTheWeek,
  getNextDayOfWeekIncludingToday,
} from "./day-of-the-week";

describe("getNextDayOfWeekIncludingToday", () => {
  it("should give you today if today is the same day of the week that you're looking for", () => {
    const dayOfTheWeek: DayOfTheWeek = "TUESDAY";
    const today = Temporal.PlainDate.from({ year: 2021, month: 10, day: 26 });
    const result = getNextDayOfWeekIncludingToday(dayOfTheWeek, today);
    expect(result).toBe(today);
  });
  it("should give you the next TUESDAY if you're looking for TUESDAY and today is WEDNESDAY", () => {
    const dayOfTheWeek: DayOfTheWeek = "TUESDAY";
    const today = Temporal.PlainDate.from({ year: 2021, month: 10, day: 27 });
    const expectedResult = Temporal.PlainDate.from({
      year: 2021,
      month: 11,
      day: 2,
    });
    const result = getNextDayOfWeekIncludingToday(dayOfTheWeek, today);
    expect(result).toStrictEqual(expectedResult);
  });
  it("should give you tomorrow if you're looking for WEDNESDAY and today is TUESDAY", () => {
    const dayOfTheWeek: DayOfTheWeek = "WEDNESDAY";
    const today = Temporal.PlainDate.from({ year: 2021, month: 10, day: 26 });
    const expectedResult = Temporal.PlainDate.from({
      year: 2021,
      month: 10,
      day: 27,
    });
    const result = getNextDayOfWeekIncludingToday(dayOfTheWeek, today);
    expect(result).toStrictEqual(expectedResult);
  });
});
