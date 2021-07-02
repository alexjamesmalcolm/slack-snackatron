import { Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { channelDoesNotHaveRotation, snackatronNotSetup } from "../../messages";
import { connect } from "../../mongodb";
import { deserializePlainDate, Group } from "../../types/group";
import { getGroupId } from "../../utils/get-group-id";
import { updateRotations } from "../../utils/update-rotations";

/**
 * @description Returns the n number of people who are on snacks next.
 */
export const handleCommandSnacksWho: Middleware<SlackCommandMiddlewareArgs> =
  async ({ ack, say, command }) => {
    await ack();
    const groupId = getGroupId(command);
    await updateRotations(groupId);
    const [mongo, close] = await connect();
    const collectionOfGroups = mongo.collection<Group>("groups");
    const group = await collectionOfGroups.findOne(
      { groupId },
      { timeout: true }
    );
    if (!group) {
      say(snackatronNotSetup);
      return close();
    }
    const snackRotation = group.snackRotations.find(
      (snackRotation) => snackRotation.channelId === command.channel_id
    );
    if (!snackRotation) {
      say(channelDoesNotHaveRotation);
      return close();
    }
    say({
      reply_broadcast: true,
      text: `On ${deserializePlainDate(
        snackRotation.nextSnackDay
      ).toString()} ${snackRotation.idsOfPeopleOnSnacks
        .map((id) => `<@${id}>`)
        .join(", ")} are providing food.`,
    });
    return close();
  };
