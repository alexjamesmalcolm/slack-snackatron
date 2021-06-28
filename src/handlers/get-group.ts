import { SlashCommand } from "@slack/bolt";
import { connect } from "../mongodb";
import { Group } from "../types/group";
import { getGroupId } from "./get-group-id";

export const getGroup = async (
  command: SlashCommand
): Promise<Group | undefined> => {
  const groupId = getGroupId(command);
  const [mongo, close] = await connect();
  const collectionOfGroups = mongo.collection<Group>("groups");
  const group = await collectionOfGroups.findOne(
    { groupId },
    { timeout: true }
  );
  await close();
  return group || undefined;
};
