import SlashMessage from "./slash-message";

interface Dishwheel {
  channel_id: SlashMessage["channel_id"];
  dishwashers: string[];
  dateCurrentDishwasherStarted: string;
  fineAmount: number;
  secondsUntilFine: number;
  finePeriodicity: number;
  currentDishwasher: string;
  creatorId: SlashMessage["user_id"];
}

export const getDishwasherAfter = (
  dishwheel: Dishwheel,
  dishwasher: string
): string => {
  const { dishwashers } = dishwheel;
  const dishwasherIndex = dishwashers.findIndex((d) => d === dishwasher);
  if (dishwasherIndex === -1) {
    throw new Error(
      `Person named ${dishwasher} is not a part of dishwheel for channel of id ${dishwheel.channel_id}`
    );
  }
  if (dishwashers.length === 1) return dishwasher;
  if (dishwashers.length - 1 === dishwasherIndex) return dishwashers[0];
  return dishwashers[dishwasherIndex + 1];
};
export const getDishwasherBefore = (
  dishwheel: Dishwheel,
  dishwasher: string
): string => {
  const { dishwashers } = dishwheel;
  const dishwasherIndex = dishwashers.findIndex((d) => d === dishwasher);
  if (dishwasherIndex === -1) {
    throw new Error(
      `Person named ${dishwasher} is not a part of dishwheel for channel of id ${dishwheel.channel_id}`
    );
  }
  if (dishwashers.length === 1) return dishwasher;
  if (dishwasherIndex === 0) return dishwashers[dishwashers.length - 1];
  return dishwashers[dishwasherIndex - 1];
};

export const getNextDishwasher = (dishwheel: Dishwheel): string =>
  getDishwasherAfter(dishwheel, dishwheel.currentDishwasher);
export const getPreviousDishwasher = (dishwheel: Dishwheel): string =>
  getDishwasherBefore(dishwheel, dishwheel.currentDishwasher);

export default Dishwheel;
