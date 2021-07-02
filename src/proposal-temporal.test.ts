import { Temporal } from "proposal-temporal";

describe("Temporal", () => {
  it("should display PlainDate prettily", () => {
    const plainDate = Temporal.PlainDate.from({ year: 2020, month: 1, day: 2 });
    expect(plainDate.toString()).toBe("2020-01-02");
    expect(plainDate.toLocaleString()).toBe("1/2/2020");
  });
});
