import {
  Middleware,
  SlackCommandMiddlewareArgs,
  SectionBlock,
} from "@slack/bolt";
import { CREATE_SNACK_ROTATION } from "../../actionIds";
import { snackatronNotSetup, channelDoesNotHaveRotation } from "../../messages";
import { connect } from "../../mongodb";
import { Group } from "../../types/group";
import { getGroupId } from "../../utils/get-group-id";

export const handleCommandSnacksManage: Middleware<SlackCommandMiddlewareArgs> =
  async ({ ack, command, respond }) => {
    await ack();
    const groupId = getGroupId(command);
    const [mongo, close] = await connect();
    const collectionOfGroups = mongo.collection<Group>("groups");
    const group = await collectionOfGroups.findOne({ groupId });
    if (!group) {
      const responseBlock: SectionBlock = {
        type: "section",
        text: { type: "plain_text", text: snackatronNotSetup },
      };
      respond({ blocks: [responseBlock] });
      return close();
    }
    const snackRotation = group.snackRotations.find(
      (snackRotation) => snackRotation.channelId === command.channel_id
    );
    if (!snackRotation) {
      const responseBlock: SectionBlock = {
        type: "section",
        text: { type: "plain_text", text: channelDoesNotHaveRotation },
        accessory: {
          type: "button",
          text: { type: "plain_text", text: "Create Rotation" },
          action_id: CREATE_SNACK_ROTATION,
          value: command.channel_id,
        },
      };
      respond({ blocks: [responseBlock] });
      return close();
    }
    return close();
  };
