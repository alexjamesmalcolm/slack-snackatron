import {
  App,
  ExpressReceiver,
  Middleware,
  SlackCommandMiddlewareArgs,
} from "@slack/bolt";

const token = process.env.SLACK_TOKEN;
const signingSecret = process.env.SLACK_SIGNING_SECRET;
if (!token) {
  throw new Error("SLACK_TOKEN is not defined");
}
if (!signingSecret) {
  throw new Error("SLACK_SIGNING_SECRET is not defined");
}

const receiver = new ExpressReceiver({ signingSecret });

const app = new App({
  token,
  receiver,
});

app.message("hello", async ({ message, say }) => {
  console.log(JSON.stringify(message));
  await say(`Hello there!`);
});

/*
/snacks-skip - skips the current snack day
/snacks-set-day - sets the day of the week that snack day is
/snacks-who - gets the list of people that are currently on snacks
*/

const respond: Middleware<SlackCommandMiddlewareArgs> = async ({
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
app.command("/snacks-skip", respond);
app.command("/snacks-set-day", respond);
app.command("/snacks-who", respond);

receiver.router.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = (process.env.PORT && Number.parseInt(process.env.PORT)) || 3000;

export const runApp = async () => {
  await app.start(port);
  console.log("⚡️ Bolt app is running!");
};
