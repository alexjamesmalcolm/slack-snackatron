import { getDurationOfNextFine } from "./time";
import { Temporal } from "proposal-temporal";

describe("getDurationOfNextFine", () => {
  it("should get in 10 minutes", () => {
    const dishesStarted = new Temporal.Instant(BigInt(0));
    const now = dishesStarted.add(Temporal.Duration.from({ minutes: 10 }));
    const durationOfNextFine = getDurationOfNextFine(
      {
        secondsUntilFine: 60 * 10,
        channel_id: "",
        creatorId: "",
        currentDishwasher: "",
        dateCurrentDishwasherStarted: dishesStarted.toString(),
        dishwashers: [],
        fineAmount: 0,
        finePeriodicity: 60 * 10,
      },
      now
    );
    expect(durationOfNextFine.humanize(true)).toBe("in 10 minutes");
  });
  it("should get in 20 minutes", () => {
    const dishesStarted = new Temporal.Instant(BigInt(0));
    const now = dishesStarted.add(Temporal.Duration.from({ minutes: 10 }));
    const durationOfNextFine = getDurationOfNextFine(
      {
        secondsUntilFine: 60 * 10,
        channel_id: "",
        creatorId: "",
        currentDishwasher: "",
        dateCurrentDishwasherStarted: dishesStarted.toString(),
        dishwashers: [],
        fineAmount: 0,
        finePeriodicity: 60 * 20,
      },
      now
    );
    expect(durationOfNextFine.humanize(true)).toBe("in 20 minutes");
  });
  it("should get in 5 minutes", () => {
    const dishesStarted = new Temporal.Instant(BigInt(0));
    const now = dishesStarted.add(Temporal.Duration.from({ minutes: 20 }));
    const durationOfNextFine = getDurationOfNextFine(
      {
        secondsUntilFine: 60 * 5,
        channel_id: "",
        creatorId: "",
        currentDishwasher: "",
        dateCurrentDishwasherStarted: dishesStarted.toString(),
        dishwashers: [],
        fineAmount: 0,
        finePeriodicity: 60 * 10,
      },
      now
    );
    expect(durationOfNextFine.humanize(true)).toBe("in 5 minutes");
  });
});
