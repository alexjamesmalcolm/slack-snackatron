import { RequestHandler } from "express";
import { connect } from "../../mongodb";
import Dishwheel from "../../types/dishwheel";
import SlashMessage from "../../types/slash-message";
import { respond } from "../respond";
import { formatMoney } from "../utils/formatMoney";
import { noDishwheelFoundResponse } from "./responses/no-dishwheel-found";

export const fineAmount: RequestHandler = async (req, res) => {
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
      `The fine amount is ${formatMoney(dishwheel.fineAmount)}.`
    );
  } else if (user_id !== dishwheel.creatorId) {
    respond(
      response_url,
      `${user_name} cannot change the dishwheel's fine amount, only the creator of the dishwheel can.`
    );
  } else {
    const fineAmount = Number.parseFloat(text.trim());
    if (!Number.isNaN(fineAmount) && fineAmount >= 0) {
      const alteredDishwheel: Dishwheel = {
        ...dishwheel,
        fineAmount,
      };
      await collectionOfDishwheels.updateOne(
        { channel_id },
        {
          $set: alteredDishwheel,
        }
      );
      respond(
        response_url,
        `Updated fine amount to ${formatMoney(fineAmount)}.`,
        true
      );
    } else {
      respond(response_url, `Could not set "${text}" as the fine amount.`);
    }
  }
  close();
};
