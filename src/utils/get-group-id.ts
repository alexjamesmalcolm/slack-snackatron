import { Context, SlashCommand } from "@slack/bolt";

const isCommand = (
  commandOrContext: SlashCommand | Context
): commandOrContext is SlashCommand => commandOrContext.response_url;

export function getGroupId(command: SlashCommand): string;
export function getGroupId(context: Context): string;
export function getGroupId(commandOrContext: SlashCommand | Context): string {
  if (isCommand(commandOrContext)) {
    const command = commandOrContext;
    if (command.enterprise_id) return command.enterprise_id;
    return command.team_id;
  }
  const context = commandOrContext;
  if (context.enterpriseId) return context.enterpriseId;
  if (context.teamId) return context.teamId;
  throw new Error("No teamId or enterpriseId found from context");
}
