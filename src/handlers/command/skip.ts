import { Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { channelDoesNotHaveRotation, snackatronNotSetup } from "../../messages";
import { connect } from "../../mongodb";
import { getNextDayOfWeek } from "../../types/day-of-the-week";
import {
  deserializePlainDate,
  Group,
  PersonInRotation,
  serializePlainDate,
  SnackRotation,
} from "../../types/group";
import { getGroupId } from "../../utils/get-group-id";

export const handleCommandSnacksSkip: Middleware<SlackCommandMiddlewareArgs> =
  async ({ ack, say, command }) => {
    await ack();
    const groupId = getGroupId(command);
    const [mongo, close] = await connect();
    const collectionOfGroups = mongo.collection<Group>("groups");
    const group = await collectionOfGroups.findOne(
      { groupId },
      { timeout: true }
    );
    if (!group) {
      await say(snackatronNotSetup);
      return close();
    }
    const snackRotation = group.snackRotations.find(
      (snackRotation) => snackRotation.channelId === command.channel_id
    );
    if (!snackRotation) {
      await say(channelDoesNotHaveRotation);
      return close();
    }
    const isOwnerOfGroup = group.ownerUserId === command.user_id;
    if (!isOwnerOfGroup) {
      await say({
        reply_broadcast: false,
        text: `<@${command.user_id}> is not the owner of the Snackatron integration.`,
      });
      return close();
    }
    const updatedSnackDate = serializePlainDate(
      getNextDayOfWeek(
        snackRotation.dayOfTheWeek,
        deserializePlainDate(snackRotation.nextSnackDay)
      )
    );
    const updatedSnackRotation: SnackRotation = {
      ...snackRotation,
      nextSnackDay: updatedSnackDate,
      peopleInRotation: snackRotation.peopleInRotation.map(
        (personInRotation): PersonInRotation => {
          if (
            personInRotation.lastTimeOnSnacks.yn ===
              snackRotation.nextSnackDay.yn &&
            personInRotation.lastTimeOnSnacks.mn ===
              snackRotation.nextSnackDay.mn &&
            personInRotation.lastTimeOnSnacks.dn ===
              snackRotation.nextSnackDay.dn
          ) {
            return { ...personInRotation, lastTimeOnSnacks: updatedSnackDate };
          }
          return personInRotation;
        }
      ),
    };

    await collectionOfGroups.updateOne(
      { groupId },
      {
        $set: {
          ...group,
          snackRotations: group.snackRotations.map(
            (snackRotation): SnackRotation => {
              if (snackRotation.channelId === updatedSnackRotation.channelId) {
                return updatedSnackRotation;
              }
              return snackRotation;
            }
          ),
        },
      }
    );
    await say({
      reply_broadcast: true,
      text: `Next snack day moved to ${deserializePlainDate(
        updatedSnackRotation.nextSnackDay
      ).toLocaleString()}`,
    });
    return close();
  };
