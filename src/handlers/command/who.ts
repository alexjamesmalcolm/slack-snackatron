import { Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { channelDoesNotHaveRotation, snackatronNotSetup } from "../../messages";
import { connect } from "../../mongodb";
import { Group } from "../../types/group";
import { getGroupId } from "../../utils/get-group-id";

/**
 * @description Returns the n number of people who are on snacks next.
 */
export const handleCommandSnacksWho: Middleware<SlackCommandMiddlewareArgs> =
  async ({ ack, respond, command }) => {
    await ack();
    const groupId = getGroupId(command);
    const [mongo, close] = await connect();
    const collectionOfGroups = mongo.collection<Group>("groups");
    const group = await collectionOfGroups.findOne(
      { groupId },
      { timeout: true }
    );
    if (!group) {
      respond(snackatronNotSetup);
      return close();
    }
    const snackRotation = group.snackRotations.find(
      (snackRotation) => snackRotation.channelId === command.channel_id
    );
    if (!snackRotation) {
      respond(channelDoesNotHaveRotation);
      return close();
    }
    respond({
      reply_broadcast: true,
      text: `On ${snackRotation.nextSnackDay.toString()} ${snackRotation.peopleOnSnacks.join(
        ", "
      )} are providing food.`,
    });
    return close();
  };
