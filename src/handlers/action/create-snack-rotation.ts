import { Middleware, SlackActionMiddlewareArgs } from "@slack/bolt";
import { snackatronNotSetup } from "../../messages";
import { connect } from "../../mongodb";
import { getNextDayOfWeek } from "../../types/day-of-the-week";
import { Group, SnackRotation } from "../../types/group";
import { getGroupId } from "../../utils/get-group-id";

export const handleActionCreateSnackRotation: Middleware<SlackActionMiddlewareArgs> =
  async ({ ack, action, respond, context }) => {
    await ack();
    const groupId = getGroupId(context);
    const [mongo, close] = await connect();
    const collectionOfGroups = mongo.collection<Group>("groups");
    const group = await collectionOfGroups.findOne({ groupId });
    if (!group) {
      respond(snackatronNotSetup);
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
      respond("There is already a snack rotation in this channel");
      return close();
    }
    const snackRotation: SnackRotation = {
      channelId: action.value,
      dayOfTheWeek: 1,
      nextSnackDay: getNextDayOfWeek(1),
      peopleInGroup: [],
      peopleOnSnacks: [],
      peoplePerSnackDay: 3,
    };
    group.snackRotations.push(snackRotation);
    await collectionOfGroups.updateOne({ groupId }, group);
    return close();
  };