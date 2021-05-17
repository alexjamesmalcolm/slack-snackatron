import express from "express";
import { urlencoded, json } from "body-parser";
import { done } from "./routes/done";
import { join } from "./routes/join";
import { who } from "./routes/who";
import { repeatingFineDuration } from "./routes/repeating-fine-duration";
import { fineAmount } from "./routes/fine-amount";
import { initialFineDuration } from "./routes/initial-fine-duration";

export const runApp = async () => {
  const app = express();

  app.use(urlencoded({ extended: false }));
  app.use(json());
  app.get("*", (req, res) => {
    res.send("Health Check: UP");
  });
  app.post("/done", done);
  app.post("/join", join);
  app.post("/who", who);
  app.post("/repeating-fine-duration", repeatingFineDuration);
  app.post("/fine-amount", fineAmount);
  app.post("/initial-fine-duration", initialFineDuration);

  const port = process.env.PORT || 8000;
  app.listen(port, () => console.log(`Listening on port: ${port}`));
};
