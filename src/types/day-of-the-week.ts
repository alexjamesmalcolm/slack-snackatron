import { Temporal } from "proposal-temporal";

type DayOfTheWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export const isNamedDayOfTheWeek = (input: any): input is DayOfTheWeek =>
  input === "MONDAY" ||
  input === "TUESDAY" ||
  input === "WEDNESDAY" ||
  input === "THURSDAY" ||
  input === "FRIDAY" ||
  input === "SATURDAY" ||
  input === "SUNDAY";

export function convertDayOfTheWeek(input: number): DayOfTheWeek;
export function convertDayOfTheWeek(input: DayOfTheWeek): number;
export function convertDayOfTheWeek(
  input: DayOfTheWeek | number
): DayOfTheWeek | number {
  if (typeof input === "string")
    switch (input.toUpperCase()) {
      case "MONDAY":
        return 1;
      case "TUESDAY":
        return 2;
      case "WEDNESDAY":
        return 3;
      case "THURSDAY":
        return 4;
      case "FRIDAY":
        return 5;
      case "SATURDAY":
        return 6;
      case "SUNDAY":
        return 7;
      default:
        throw new Error(`${input} is not a day of the week`);
    }
  switch (input) {
    case 1:
      return "MONDAY";
    case 2:
      return "TUESDAY";
    case 3:
      return "WEDNESDAY";
    case 4:
      return "THURSDAY";
    case 5:
      return "FRIDAY";
    case 6:
      return "SATURDAY";
    case 7:
      return "SUNDAY";
    default:
      throw new Error(
        `${input} is not a number referring to a day of the week (e.g. 1-7 -> Monday-Sunday)`
      );
  }
}

export const getNextDayOfWeek = (
  input: number | DayOfTheWeek,
  today = Temporal.now.plainDateISO()
): Temporal.PlainDate => {
  const dayOfTheWeek = isNamedDayOfTheWeek(input)
    ? convertDayOfTheWeek(input)
    : input;
  const tomorrow = today.add({ days: 1 });
  if (tomorrow.dayOfWeek === dayOfTheWeek) return tomorrow;
  return getNextDayOfWeek(dayOfTheWeek, tomorrow);
};
