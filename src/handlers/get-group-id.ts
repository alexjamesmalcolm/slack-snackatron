import { SlashCommand } from "@slack/bolt";

export const getGroupId = (command: SlashCommand): string => {
  if (command.enterprise_id) return command.enterprise_id;
  return command.team_id;
};
