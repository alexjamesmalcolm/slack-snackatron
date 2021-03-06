import {
  Middleware,
  SlackViewAction,
  SlackViewMiddlewareArgs,
} from "@slack/bolt";
import { snackatronNotSetup } from "../../messages";
import { connect } from "../../mongodb";
import { Group } from "../../types/group";
import { getGroupId } from "../../utils/get-group-id";

export const handleActionCreateSnackRotation: Middleware<
  SlackViewMiddlewareArgs<SlackViewAction>
> = async ({ ack, context, client, view, body }) => {
  await ack();
  const groupId = getGroupId(context);
  const [mongo, close] = await connect();
  const collectionOfGroups = mongo.collection<Group>("groups");
  const group = await collectionOfGroups.findOne({ groupId });
  console.log({ view, body });
  if (!group) {
    await client.chat.postMessage({
      channel: body.user.id,
      text: snackatronNotSetup,
    });
    return close();
  }
  // if (action.type !== "button") {
  //   throw new Error(
  //     `Expected action type to be button but instead was ${action.type}`
  //   );
  // }
  // const existingSnackRotation = group.snackRotations.find(
  //   (snackRotation) => snackRotation.channelId === action.value
  // );
  // if (existingSnackRotation) {
  //   say("There is already a snack rotation in this channel");
  //   return close();
  // }
  // const snackRotation: SnackRotation = {
  //   channelId: action.value,
  //   dayOfTheWeek: 1,
  //   nextSnackDay: serializePlainDate(getNextDayOfWeek(1)),
  //   peopleInRotation: [],
  //   idsOfPeopleOnSnacks: [],
  //   peoplePerSnackDay: 3,
  // };
  // group.snackRotations.push(snackRotation);
  // await collectionOfGroups.updateOne({ groupId }, { $set: group });
  return close();
};
