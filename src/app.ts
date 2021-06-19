import { installUrl, installer } from "./installer";
import { createServer } from "http";

export const runApp = () => {
  const server = createServer((req, res) => {
    // our redirect_uri is /slack/oauth_redirect
    if (req.url === "/slack/oauth_redirect") {
      // call installer.handleCallback to wrap up the install flow
      installer.handleCallback(req, res);
    }
  });

  server.listen(3000);
};
