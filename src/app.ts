import { App, ExpressReceiver } from "@slack/bolt";
import { CREATE_SNACK_ROTATION } from "./actionIds";
import { handleActionCreateSnackRotation } from "./handlers/action/create-snack-rotation";
import { handleCommandSnacksJoin } from "./handlers/command/join";
import { handleCommandSnacksLeave } from "./handlers/command/leave";
import { handleCommandSnacksManage } from "./handlers/command/manage";
import { handleCommandSnacksOwner } from "./handlers/command/owner";
import { handleCommandSnacksSkip } from "./handlers/command/skip";
import { handleCommandSnacksWho } from "./handlers/command/who";

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

app.command("/snacks-skip", handleCommandSnacksSkip);
// app.command("/snacks-day", handleSnacksDay);
// app.command("/snacks-people-per-day", handleSnacksPeoplePerDay);
app.command("/snacks-manage", handleCommandSnacksManage);
app.command("/snacks-join", handleCommandSnacksJoin);
app.command("/snacks-leave", handleCommandSnacksLeave);
app.command("/snacks-who", handleCommandSnacksWho);
app.command("/snacks-owner", handleCommandSnacksOwner);
app.view(CREATE_SNACK_ROTATION, handleActionCreateSnackRotation);

receiver.router.get("/", (_req, res) => {
  res.send("Hello World!");
});

const port = (process.env.PORT && Number.parseInt(process.env.PORT)) || 3000;

export const runApp = async () => {
  await app.start(port);
  console.log("⚡️ Bolt app is running!");
};
