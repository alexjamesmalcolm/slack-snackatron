import { Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { Temporal } from "proposal-temporal";
import { channelDoesNotHaveRotation, snackatronNotSetup } from "../../messages";
import { connect } from "../../mongodb";
import { Group, SnackRotation } from "../../types/group";
import { getGroupId } from "../../utils/get-group-id";

export const handleCommandSnacksJoin: Middleware<SlackCommandMiddlewareArgs> =
  async ({ ack, say, command }) => {
    await ack();
    const groupId = getGroupId(command);
    const [mongo, close] = await connect();
    const collectionOfGroups = mongo.collection<Group>("groups");
    const group = await collectionOfGroups.findOne({ groupId });
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
    const isAlreadyInRotation = snackRotation.peopleInRotation.some(
      (personInRotation) => personInRotation.userId === command.user_id
    );
    if (isAlreadyInRotation) {
      say(`<@${command.user_id}> is already a part of the snack rotation.`);
      return close();
    }
    const isAlreadyInGroup = group.peopleInGroup.some(
      (personInGroup) => personInGroup.userId === command.user_id
    );
    const updatedPeopleInGroup = isAlreadyInGroup
      ? group.peopleInGroup
      : [
          ...group.peopleInGroup,
          {
            userId: command.user_id,
            userName: command.user_name,
          },
        ];
    const updatedGroup: Group = {
      ...group,
      peopleInGroup: updatedPeopleInGroup,
      snackRotations: group.snackRotations.map(
        (snackRotation): SnackRotation => {
          if (snackRotation.channelId === command.channel_id) {
            return {
              ...snackRotation,
              peopleInRotation: [
                ...snackRotation.peopleInRotation,
                {
                  userId: command.user_id,
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
        }
      ),
    };
    await collectionOfGroups.updateOne({ groupId }, { $set: updatedGroup });
    say({
      text: `<@${command.user_id}> joined the snack rotation.`,
      reply_broadcast: true,
    });
    return close();
  };
