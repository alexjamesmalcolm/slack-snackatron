import {
  Middleware,
  SlackCommandMiddlewareArgs,
  SectionBlock,
  PlainTextElement,
  KnownBlock,
  Block,
} from "@slack/bolt";
import { CREATE_SNACK_ROTATION } from "../../actionIds";
import { snackatronNotSetup, channelDoesNotHaveRotation } from "../../messages";
import { connect } from "../../mongodb";
import { Group } from "../../types/group";
import { getGroupId } from "../../utils/get-group-id";

interface ModalView {
  type: "modal";
  title: PlainTextElement;
  blocks: (KnownBlock | Block)[];
  close?: PlainTextElement;
  submit?: PlainTextElement;
  private_metadata?: string;
  callback_id?: string;
  clear_on_close?: boolean; // defaults to false
  notify_on_close?: boolean; // defaults to false
  external_id?: string;
}

export const handleCommandSnacksManage: Middleware<SlackCommandMiddlewareArgs> =
  async ({ ack, command, say, body, client }) => {
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
      say({ blocks: [responseBlock] });
      return close();
    }
    const snackRotation = group.snackRotations.find(
      (snackRotation) => snackRotation.channelId === command.channel_id
    );
    const groupInformationBlock: SectionBlock = {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `ID: ${group.groupId}\nOwner: <@${
          group.ownerUserId
        }>\nMembers:\n${group.peopleInGroup
          .map((personInGroup) => {
            if (personInGroup.spouseUserId)
              return `- <@${personInGroup.userId}>, who is married to <@${personInGroup.spouseUserId}>`;
            return `- <@${personInGroup.userId}>`;
          })
          .join("\n")}`,
      },
    };
    if (!snackRotation) {
      const responseBlock: SectionBlock = {
        type: "section",
        text: { type: "plain_text", text: channelDoesNotHaveRotation },
      };
      const modalView: ModalView = {
        type: "modal",
        title: { type: "plain_text", text: "Create Rotation" },
        blocks: [groupInformationBlock, responseBlock],
        submit: { type: "plain_text", text: "Create Rotation" },
      };
      console.log("Querying to create rotation");
      const result = await client.views
        .open({
          trigger_id: body.trigger_id,
          view: modalView,
        })
        .catch(console.error);
      console.log(result);
      return close();
    }
    const usersOnSnacksBlock: SectionBlock = {
      type: "section",
      text: {
        type: "plain_text",
        text:
          snackRotation.idsOfPeopleOnSnacks.length > 0
            ? snackRotation.idsOfPeopleOnSnacks
                .map((id) => `<@${id}>`)
                .join(", ")
            : "There is no one assigned to snacks.",
      },
    };
    const modalView: ModalView = {
      title: { type: "plain_text", text: "Snackatron" },
      blocks: [groupInformationBlock, usersOnSnacksBlock],
      type: "modal",
    };
    console.log("Managing Rotation");
    const result = await client.views
      .open({
        trigger_id: body.trigger_id,
        view: modalView,
      })
      .catch(console.error);
    console.log(result);
    return close();
  };
