import { App, ExpressReceiver } from "@slack/bolt";
import { handleSnacksOwner } from "./handlers/handle-snacks-owner";
// import { handleSnacksSetDay } from "./handlers/handle-snacks-set-day";
import { handleSnacksSkip } from "./handlers/handle-snacks-skip";
import { handleSnacksWho } from "./handlers/handle-snacks-who";

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

app.command("/snacks-skip", handleSnacksSkip);
// app.command("/snacks-day", handleSnacksDay);
// app.command("/snacks-people-per-day", handleSnacksPeoplePerDay);
// app.command("/snacks-join", handleSnacksJoin);
// app.command("/snacks-leave", handleSnacksLeave);
/**
 * @description Returns the n number of people who are on snacks next.
 */
app.command("/snacks-who", handleSnacksWho);
/**
 * @description If there is no Snackatron owner of this group then the caller of this command becomes that person. In the future can also be used to change ownership.
 */
app.command("/snacks-owner", handleSnacksOwner);

receiver.router.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = (process.env.PORT && Number.parseInt(process.env.PORT)) || 3000;

export const runApp = async () => {
  await app.start(port);
  console.log("⚡️ Bolt app is running!");
};
