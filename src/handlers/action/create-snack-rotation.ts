import { Middleware, SlackActionMiddlewareArgs } from "@slack/bolt";
import { snackatronNotSetup } from "../../messages";
import { connect } from "../../mongodb";
import { getNextDayOfWeek } from "../../types/day-of-the-week";
import { Group, serializePlainDate, SnackRotation } from "../../types/group";
import { getGroupId } from "../../utils/get-group-id";

export const handleActionCreateSnackRotation: Middleware<SlackActionMiddlewareArgs> =
  async ({ ack, action, say, context }) => {
    await ack();
    const groupId = getGroupId(context);
    const [mongo, close] = await connect();
    const collectionOfGroups = mongo.collection<Group>("groups");
    const group = await collectionOfGroups.findOne({ groupId });
    if (!group) {
      say(snackatronNotSetup);
      return close();
    }
    if (action.type !== "button") {
      throw new Error(
        `Expected action type to be button but instead was ${action.type}`
      );
    }
    const existingSnackRotation = group.snackRotations.find(
      (snackRotation) => snackRotation.channelId === action.value
    );
    if (existingSnackRotation) {
      say("There is already a snack rotation in this channel");
      return close();
    }
    const snackRotation: SnackRotation = {
      channelId: action.value,
      dayOfTheWeek: 1,
      nextSnackDay: serializePlainDate(getNextDayOfWeek(1)),
      peopleInRotation: [],
      idsOfPeopleOnSnacks: [],
      peoplePerSnackDay: 3,
    };
    group.snackRotations.push(snackRotation);
    await collectionOfGroups.updateOne({ groupId }, { $set: group });
    return close();
  };
