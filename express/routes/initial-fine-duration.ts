import { RequestHandler } from "express";
import { connect } from "../../mongodb";
import Dishwheel from "../../types/dishwheel";
import SlashMessage from "../../types/slash-message";
import { respond } from "../respond";
import { noDishwheelFoundResponse } from "./responses/no-dishwheel-found";

export const initialFineDuration: RequestHandler = async (req, res) => {
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
      `The initial fine duration in seconds is ${dishwheel.secondsUntilFine}.`
    );
  } else if (user_id !== dishwheel.creatorId) {
    respond(
      response_url,
      `${user_name} cannot change the dishwheel's initial fine duration, only the creator of the dishwheel can.`
    );
  } else {
    const secondsUntilFine = Number.parseFloat(text.trim());
    if (!Number.isNaN(secondsUntilFine) && secondsUntilFine >= 0) {
      const alteredDishwheel: Dishwheel = {
        ...dishwheel,
        secondsUntilFine,
      };
      await collectionOfDishwheels.updateOne(
        { channel_id },
        {
          $set: alteredDishwheel,
        }
      );
      respond(
        response_url,
        `Updated initial fine duration to ${dishwheel.secondsUntilFine} seconds.`,
        true
      );
    } else {
      respond(
        response_url,
        `Could not set "${text}" as the initial fine duration in seconds.`
      );
    }
  }
  close();
};
