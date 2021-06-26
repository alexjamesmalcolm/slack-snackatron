import { Middleware, SlackCommandMiddlewareArgs } from "@slack/bolt";

export const handleSnacksSkip: Middleware<SlackCommandMiddlewareArgs> = async ({
  ack,
  say,
  command,
}) => {
  try {
    await ack();
    say(`Hello there.
\`\`\`
${JSON.stringify(command, null, 2)}
\`\`\`
`);
  } catch (error) {
    console.error(error);
  }
};
