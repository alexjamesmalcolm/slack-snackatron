import { App } from "@slack/bolt";
const token = process.env.SLACK_TOKEN;
const signingSecret = process.env.SLACK_SIGNING_SECRET;
const app = new App({
  token,
  signingSecret,
});

app.message("snackatron", async ({ message, say }) => {
  console.log(JSON.stringify(message));
  await say(`Hello there!`);
});

const port = (process.env.PORT && Number.parseInt(process.env.PORT)) || 3000;

export const runApp = async () => {
  await app.start(port);
  console.log("⚡️ Bolt app is running!");
};
