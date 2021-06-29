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
  async ({ ack, command, respond, body, client }) => {
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
      };
      const result = await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          type: "modal",
          blocks: [responseBlock],
          submit: { type: "plain_text", text: "Create Rotation" },
          submit_disabled: false,
        },
      });
      console.log(result);
      return close();
    }
    const responseBlock: SectionBlock = {
      type: "section",
      text: { type: "plain_text", text: "Manage this thing!" },
    };
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        blocks: [responseBlock],
        submit_disabled: true,
      },
    });
    return close();
  };
