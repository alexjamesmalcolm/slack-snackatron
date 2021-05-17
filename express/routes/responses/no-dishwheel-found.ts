import SlashMessage from "../../../types/slash-message";
import { respond } from "../../respond";

export const noDishwheelFoundResponse = (message: SlashMessage) =>
  respond(
    message.response_url,
    `No dishwheel in channel ${message.channel_name}.`
  );
