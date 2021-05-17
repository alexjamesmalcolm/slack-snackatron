import { RequestHandler } from "express";
import { connect } from "../../mongodb";
import Dishwheel from "../../types/dishwheel";
import SlashMessage from "../../types/slash-message";
import { respond } from "../respond";
import { noDishwheelFoundResponse } from "./responses/no-dishwheel-found";

export const repeatingFineDuration: RequestHandler = async (req, res) => {
  const message = req.body as SlashMessage;
  const { channel_id, text, user_id, user_name, response_url } = message;
  res.send();
  const [mongo, close] = await connect();
  const collectionOfDishwheels = mongo.collection<Dishwheel>("dishwheels");
  const dishwheel = await collectionOfDishwheels.findOne(
    { channel_id },
    { timeout: true }
  );
  if (!dishwheel) {
    noDishwheelFoundResponse(message);
  } else if (text.trim() === "") {
    respond(
      response_url,
      `The repeating fine duration is ${dishwheel.finePeriodicity} seconds.`
    );
  } else if (user_id !== dishwheel.creatorId) {
    respond(
      response_url,
      `${user_name} cannot change the dishwheel's repeating fine duration, only the creator of the dishwheel can.`
    );
  } else {
    const finePeriodicity = Number.parseFloat(text.trim());
    if (!Number.isNaN(finePeriodicity) && finePeriodicity >= 0) {
      const alteredDishwheel: Dishwheel = {
        ...dishwheel,
        finePeriodicity,
      };
      await collectionOfDishwheels.updateOne(
        { channel_id },
        {
          $set: alteredDishwheel,
        }
      );
      respond(
        response_url,
        `Updated repeating fine duration to ${dishwheel.finePeriodicity} seconds.`,
        true
      );
    } else {
      respond(
        response_url,
        `Could not set "${text}" as the repeating fine duration.`
      );
    }
  }
  close();
};
