import { RequestHandler } from "express";
import { connect } from "../../mongodb";
import Dishwheel, { getNextDishwasher } from "../../types/dishwheel";
import SlashMessage from "../../types/slash-message";
import { respond } from "../respond";
import { formatMoney } from "../utils/formatMoney";
import { noDishwheelFoundResponse } from "./responses/no-dishwheel-found";

export const done: RequestHandler = async (req, res) => {
  const message = req.body as SlashMessage;
  const { channel_id, user_name: person, response_url } = message;
  res.send();
  const [mongo, close] = await connect();
  const collectionOfDishwheels = mongo.collection<Dishwheel>("dishwheels");
  const dishwheel = await collectionOfDishwheels.findOne(
    { channel_id },
    { timeout: true }
  );
  if (!dishwheel) {
    noDishwheelFoundResponse(message);
  } else if (!dishwheel.dishwashers.includes(person)) {
    respond(
      response_url,
      "You are not a member of this dishwheel. You must first join the dishwheel before you can complete dishes."
    );
  } else if (dishwheel.currentDishwasher !== person) {
    respond(response_url, `You are not on dishes.`);
  } else {
    const alteredDishwheel: Dishwheel = {
      ...dishwheel,
      dateCurrentDishwasherStarted: new Date().toISOString(),
      currentDishwasher: getNextDishwasher(dishwheel),
    };
    await collectionOfDishwheels.updateOne(
      { channel_id },
      {
        $set: alteredDishwheel,
      }
    );
    const isItPossibleForThereToBeAFine =
      dishwheel.fineAmount > 0 && dishwheel.secondsUntilFine > 0;
    const millisecondsOnDishes =
      new Date().getTime() -
      new Date(dishwheel.dateCurrentDishwasherStarted).getTime();
    const countOfFinePeriodsPassed =
      dishwheel.finePeriodicity > 0
        ? 1 +
          (millisecondsOnDishes - dishwheel.secondsUntilFine * 1000) /
            (dishwheel.finePeriodicity * 1000)
        : millisecondsOnDishes / (dishwheel.secondsUntilFine * 1000);
    const accruedFine =
      Math.floor(countOfFinePeriodsPassed) * dishwheel.fineAmount;
    const hasFine = isItPossibleForThereToBeAFine && accruedFine > 0;
    if (hasFine) {
      respond(
        response_url,
        `${person} completed the dishes with a fine of ${formatMoney(
          accruedFine
        )}, ${alteredDishwheel.currentDishwasher} is now up.`,
        true
      );
    } else {
      respond(
        response_url,
        `${person} completed the dishes, ${alteredDishwheel.currentDishwasher} is now up.`,
        true
      );
    }
  }
  close();
};
