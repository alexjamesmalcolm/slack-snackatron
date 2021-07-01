import { Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { connect } from "../../mongodb";
import { getNextDayOfWeek } from "../../types/day-of-the-week";
import { Group, serializePlainDate } from "../../types/group";
import { getGroupId } from "../../utils/get-group-id";

/**
 * @description Gets the owner of the Snackatron integration. If there is no Snackatron owner of this group then the caller of this command becomes that person. In the future can also be used to change ownership.
 */
export const handleCommandSnacksOwner: Middleware<SlackCommandMiddlewareArgs> =
  async ({ ack, command, say }) => {
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
        ownerUserId: command.user_id,
        peopleInGroup: [
          { userId: command.user_id, userName: command.user_name },
        ],
        snackRotations: [
          {
            channelId: command.channel_id,
            dayOfTheWeek: 1,
            nextSnackDay: serializePlainDate(getNextDayOfWeek(1)),
            peoplePerSnackDay: 3,
            idsOfPeopleOnSnacks: [],
            peopleInRotation: [],
          },
        ],
      });
      say({
        text: `<@${command.user_id}> created a snack group.`,
        reply_broadcast: true,
      });
    } else {
      if (command.text) {
        if (group.ownerUserId === command.user_id) {
          say("Changing owners is not yet implemented.");
        } else {
          say(
            `You are not authorized to change the owner of the Snackatron integration.`
          );
        }
      } else {
        say(
          `<@${group.ownerUserId}> is the owner of the Snackatron integration.`
        );
      }
    }

    await close();
  };
