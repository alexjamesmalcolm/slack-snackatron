import { scheduleJob, RecurrenceRule } from "node-schedule";
import { notify } from "node-notifier";
import { connect } from "../mongodb";

export const scheduleReminder = () => {
  const rule: RecurrenceRule = new RecurrenceRule();
  rule.minute = 0;
  scheduleJob(rule, async () => {
    const [mongo, close] = await connect();
    console.log("Hello");
    notify("Hello");
    close();
  });
};
