import { Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { connect } from "../mongodb";
import { getNextDayOfWeek } from "../types/day-of-the-week";
import { Group } from "../types/group";
import { getGroupId } from "./get-group-id";

export const handleSnacksOwner: Middleware<SlackCommandMiddlewareArgs> =
  async ({ ack, command, say, respond }) => {
    await ack();
    const groupId = getGroupId(command);
    const [mongo, close] = await connect();
    const collectionOfGroups = mongo.collection<Group>("groups");
    const group = await collectionOfGroups.findOne(
      { groupId },
      { timeout: true }
    );
    if (!group) {
      await collectionOfGroups.insertOne({
        groupId,
        ownerUsername: command.user_name,
        snackRotations: [
          {
            channelId: command.channel_id,
            dayOfTheWeek: 1,
            nextSnackDay: getNextDayOfWeek(1),
            peopleInGroup: [],
            peopleOnSnacks: [],
          },
        ],
      });
      say(`<@${command.user_name}> created a snack group.`);
    } else {
      if (command.text) {
        if (group.ownerUsername === command.user_name) {
          respond("Changing owners is not yet implemented.");
        } else {
          respond(
            `You are not authorized to change the owner of the Snackatron integration.`
          );
        }
      } else {
        respond(
          `<@${group.ownerUsername}> is the owner of the Snackatron integration.`
        );
      }
    }

    await close();
  };
