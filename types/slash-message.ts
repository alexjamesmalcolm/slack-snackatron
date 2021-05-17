// interface SlashMessage {
//   token: "SpXOSjPw1XKA8Ha6w0bvl1BF";
//   team_id: "T01FE3QACV7";
//   team_domain: "novahomegroup";
//   channel_id: "D01J90FTNLV";
//   channel_name: "directmessage";
//   user_id: "U01K1TT33T2";
//   user_name: "alexjamesmalcolm";
//   command: "/dishes-add";
//   text: "@alexjamesmalcolm";
//   api_app_id: "A01QLF2P867";
//   is_enterprise_install: "false";
//   response_url: "https://hooks.slack.com/commands/T01FE3QACV7/1849365351441/V8hUk6LmRW4iYqCKsv8xFoxg";
//   trigger_id: "1821965054359.1524126352993.2f61b0481086a0d4677343089547a468";
// }

interface SlashMessage {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  api_app_id: string;
  is_enterprise_install: string;
  response_url: string;
  trigger_id: string;
}

export default SlashMessage;
