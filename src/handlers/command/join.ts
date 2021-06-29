import { Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { Temporal } from "proposal-temporal";
import { channelDoesNotHaveRotation, snackatronNotSetup } from "../../messages";
import { connect } from "../../mongodb";
import { Group } from "../../types/group";
import { getGroupId } from "../../utils/get-group-id";

export const handleCommandSnacksJoin: Middleware<SlackCommandMiddlewareArgs> =
  async ({ ack, respond, command }) => {
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
    if (
      snackRotation.peopleInGroup.some(
        (personInGroup) => personInGroup.name === command.user_name
      )
    ) {
      respond(
        `<@${command.user_name}> is already a part of the snack rotation.`
      );
      return close();
    }
    const updatedGroup: Group = {
      ...group,
      snackRotations: group.snackRotations.map((snackRotation) => {
        if (snackRotation.channelId === command.channel_id) {
          return {
            ...snackRotation,
            peopleInGroup: [
              ...snackRotation.peopleInGroup,
              {
                name: command.user_name,
                lastTimeOnSnacks: Temporal.PlainDate.from({
                  year: 1,
                  month: 1,
                  day: 1,
                }),
              },
            ],
          };
        }
        return snackRotation;
      }),
    };
    await collectionOfGroups.updateOne({ groupId }, updatedGroup);
    respond({
      text: `<@${command.user_name} joined the snack rotation.`,
      reply_broadcast: true,
    });
    return close();
  };
