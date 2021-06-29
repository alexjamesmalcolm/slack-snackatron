import {
  Middleware,
  SlackCommandMiddlewareArgs,
  SectionBlock,
} from "@slack/bolt";
import { CREATE_SNACK_ROTATION } from "../../actionIds";
import { snackatronNotSetup, channelDoesNotHaveRotation } from "../../messages";
import { getGroup } from "../../utils/get-group";

export const handleCommandSnacksManage: Middleware<SlackCommandMiddlewareArgs> =
  async ({ ack, command, respond }) => {
    const group = await getGroup(command);
    if (!group) {
      const responseBlock: SectionBlock = {
        type: "section",
        text: { type: "plain_text", text: snackatronNotSetup },
      };
      respond({ blocks: [responseBlock] });
      return;
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
      return;
    }
  };
