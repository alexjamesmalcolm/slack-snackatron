import { Duration, duration } from "moment";
import { Temporal } from "proposal-temporal";
import Dishwheel from "../../types/dishwheel";

const getInstantOfNextFine = ({
  current,
  initialDuration,
  instantDishesStarted,
  secondaryDuration,
}: {
  instantDishesStarted: Temporal.Instant;
  initialDuration: Temporal.Duration;
  secondaryDuration: Temporal.Duration;
  current: Temporal.Instant;
}): Temporal.Instant => {
  const instantWhenGivenFirstFine = instantDishesStarted.add(initialDuration);
  let previousInstant = instantWhenGivenFirstFine;
  while (true) {
    const comparison = Temporal.Instant.compare(previousInstant, current);
    const isPreviousInstantInThePast = comparison <= 0;
    if (!isPreviousInstantInThePast) {
      return previousInstant;
    }
    previousInstant = previousInstant.add(secondaryDuration);
  }
};

export const getDurationOfNextFine = (
  dishwheel: Dishwheel,
  current = Temporal.now.instant()
): Duration => {
  const instantDishesStarted = Temporal.Instant.from(
    dishwheel.dateCurrentDishwasherStarted
  );
  const initialDuration = Temporal.Duration.from({
    seconds: dishwheel.secondsUntilFine,
  });
  const secondaryDuration = Temporal.Duration.from({
    seconds: dishwheel.finePeriodicity,
  });
  const instantOfNextFine = getInstantOfNextFine({
    instantDishesStarted,
    current,
    initialDuration,
    secondaryDuration,
  });
  const remainingDuration = current.until(instantOfNextFine);
  return duration(remainingDuration.total({ unit: "milliseconds" }));
};
