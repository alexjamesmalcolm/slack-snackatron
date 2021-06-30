import { Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { channelDoesNotHaveRotation, snackatronNotSetup } from "../../messages";
import { connect } from "../../mongodb";
import { Group, SnackRotation } from "../../types/group";
import { getGroupId } from "../../utils/get-group-id";

export const handleCommandSnacksLeave: Middleware<SlackCommandMiddlewareArgs> =
  async ({ ack, command, respond }) => {
    await ack();
    const groupId = getGroupId(command);
    const [mongo, close] = await connect();
    const collectionOfGroups = mongo.collection<Group>("groups");
    const group = await collectionOfGroups.findOne({ groupId });
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
    const isPersonNotInRotation = snackRotation.peopleInRotation.every(
      (personInRotation) => personInRotation.userId !== command.user_id
    );
    if (isPersonNotInRotation) {
      respond(
        `<@${command.user_id}> is already not a part of the snack rotation.`
      );
      return close();
    }
    const updatedGroup: Group = {
      ...group,
      snackRotations: group.snackRotations.map(
        (snackRotation): SnackRotation => {
          if (snackRotation.channelId === command.channel_id) {
            return {
              ...snackRotation,
              peopleInRotation: snackRotation.peopleInRotation.filter(
                (personInRotation) =>
                  personInRotation.userId !== command.user_id
              ),
            };
          }
          return snackRotation;
        }
      ),
    };
    await collectionOfGroups.updateOne({ groupId }, { $set: updatedGroup });
    respond({
      text: `<@${command.user_id}> left the snack rotation.`,
      reply_broadcast: true,
    });
    return close();
  };
