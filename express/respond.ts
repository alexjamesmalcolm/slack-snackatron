import fetch from "node-fetch";

export const respond = (
  responseUrl: string,
  message: string,
  isPublic?: boolean
) =>
  fetch(responseUrl, {
    method: "POST",
    body: JSON.stringify({
      text: message,
      response_type: isPublic ? "in_channel" : "ephemeral",
    }),
  });
