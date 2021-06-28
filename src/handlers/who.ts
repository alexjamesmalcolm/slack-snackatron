import { Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { channelDoesNotHaveRotation, snackatronNotSetup } from "../messages";
import { getGroup } from "../utils/get-group";

/**
 * @description Returns the n number of people who are on snacks next.
 */
export const handleSnacksWho: Middleware<SlackCommandMiddlewareArgs> = async ({
  ack,
  respond,
  command,
}) => {
  await ack();
  const group = await getGroup(command);
  if (!group) {
    respond(snackatronNotSetup);
  } else {
    const snackRotation = group.snackRotations.find(
      (snackRotation) => snackRotation.channelId === command.channel_id
    );
    if (!snackRotation) {
      respond(channelDoesNotHaveRotation);
    } else {
      respond({
        reply_broadcast: true,
        text: `On ${snackRotation.nextSnackDay.toString()} ${snackRotation.peopleOnSnacks.join(
          ", "
        )} are providing food.`,
      });
    }
  }
};
