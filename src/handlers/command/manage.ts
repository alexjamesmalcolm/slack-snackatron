import {
  Middleware,
  SlackCommandMiddlewareArgs,
  SectionBlock,
  View,
} from "@slack/bolt";
import { CREATE_SNACK_ROTATION } from "../../actionIds";
import { snackatronNotSetup, channelDoesNotHaveRotation } from "../../messages";
import { connect } from "../../mongodb";
import { Group } from "../../types/group";
import { getGroupId } from "../../utils/get-group-id";

export const handleCommandSnacksManage: Middleware<
  SlackCommandMiddlewareArgs
> = async ({ ack, command, say, body, client }) => {
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
  const peopleInGroupBlock: SectionBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `Members:\n${group.peopleInGroup
        .map((personInGroup) => {
          if (personInGroup.spouseUserId)
            return `- <@${personInGroup.userId}>, who is married to <@${personInGroup.spouseUserId}>`;
          return `- <@${personInGroup.userId}>`;
        })
        .join("\n")}`,
    },
  };
  const idBlock: SectionBlock = {
    type: "section",
    text: {
      type: "plain_text",
      text: `ID: ${group.groupId}`,
    },
  };
  const ownerBlock: SectionBlock = {
    type: "section",
    text: {
      type: "plain_text",
      text: `Owner: <@${group.ownerUserId}>`,
    },
  };
  if (!snackRotation) {
    const responseBlock: SectionBlock = {
      type: "section",
      text: { type: "plain_text", text: channelDoesNotHaveRotation },
    };
    const modalView: View = {
      type: "modal",
      title: { type: "plain_text", text: "Create Rotation" },
      blocks: [idBlock, ownerBlock, peopleInGroupBlock, responseBlock],
      submit: { type: "plain_text", text: "Create Rotation" },
      callback_id: CREATE_SNACK_ROTATION,
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
  const usersInRotationBlock: SectionBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `Members of Rotation:\n${snackRotation.peopleInRotation
        .map((personInRotation) => `- <@${personInRotation.userId}>`)
        .join("\n")}`,
    },
  };
  const usersOnSnacksBlock: SectionBlock = {
    type: "section",
    text: {
      type: "plain_text",
      text:
        snackRotation.idsOfPeopleOnSnacks.length > 0
          ? snackRotation.idsOfPeopleOnSnacks.map((id) => `<@${id}>`).join(", ")
          : "There is no one assigned to snacks.",
    },
  };
  const modalView: View = {
    title: { type: "plain_text", text: "Snackatron" },
    blocks: [
      idBlock,
      ownerBlock,
      peopleInGroupBlock,
      usersInRotationBlock,
      usersOnSnacksBlock,
    ],
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
