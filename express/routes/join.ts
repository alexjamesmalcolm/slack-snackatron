import { RequestHandler } from "express";
import { connect } from "../../mongodb";
import Dishwheel, {
  getDishwasherAfter,
  getDishwasherBefore,
} from "../../types/dishwheel";
import SlashMessage from "../../types/slash-message";
import { respond } from "../respond";

export const join: RequestHandler = async (req, res) => {
  res.send();
  const [mongo, close] = await connect();
  const {
    response_url: responseUrl,
    channel_id,
    user_id,
    user_name: person,
  } = req.body as SlashMessage;
  const collectionOfDishwheels = mongo.collection<Dishwheel>("dishwheels");
  const dishwheel = await collectionOfDishwheels.findOne(
    { channel_id },
    { timeout: true }
  );
  if (dishwheel) {
    if (dishwheel.dishwashers.includes(person)) {
      respond(responseUrl, "You are already on the dishwheel.");
    } else {
      const alteredDishwheel = {
        ...dishwheel,
        dishwashers: dishwheel.dishwashers.concat([person]),
      };
      await collectionOfDishwheels.updateOne(
        { channel_id },
        {
          $set: alteredDishwheel,
        }
      );
      respond(
        responseUrl,
        `${person} joined the dishwheel and is after ${getDishwasherBefore(
          alteredDishwheel,
          person
        )} and before ${getDishwasherAfter(alteredDishwheel, person)}`,
        true
      );
    }
  } else {
    await collectionOfDishwheels.insertOne({
      channel_id,
      creatorId: user_id,
      currentDishwasher: person,
      dateCurrentDishwasherStarted: new Date().toString(),
      dishwashers: [person],
      fineAmount: 0,
      finePeriodicity: 0,
      secondsUntilFine: 0,
    });
    respond(responseUrl, `${person} started a dishwheel!`, true);
  }
  close();
};
