import {
  Installation as SlackInstallation,
  InstallProvider,
} from "@slack/oauth";
import { connect } from "./mongodb";

const slackClientId = process.env.SLACK_CLIENT_ID;
const slackClientSecret = process.env.SLACK_CLIENT_SECRET;
if (!slackClientId) {
  throw new Error("SLACK_CLIENT_ID not defined");
}
if (!slackClientSecret) {
  throw new Error("SLACK_CLIENT_SECRET not defined");
}

interface StoredInstallation {
  id: string;
  installation: SlackInstallation;
}

export const installer = new InstallProvider({
  clientId: slackClientId,
  clientSecret: slackClientSecret,
  stateSecret: "my-state-secret",
  installationStore: {
    storeInstallation: async (installation) => {
      const [mongo, close] = await connect();
      const collectionOfInstallations =
        mongo.collection<StoredInstallation>("installations");
      const id = installation.isEnterpriseInstall
        ? installation.enterprise?.id
        : installation.team?.id;
      if (id) {
        const storedInstallation: StoredInstallation = { id, installation };
        const alreadyStoredInstallation =
          await collectionOfInstallations.findOne({ id }, { timeout: true });
        if (alreadyStoredInstallation) {
          collectionOfInstallations.updateOne(
            { id },
            { $set: storedInstallation }
          );
        } else {
          await collectionOfInstallations.insertOne(storedInstallation);
        }
      }
      close();
    },
    fetchInstallation: async (installQuery) => {
      const [mongo, close] = await connect();
      const collectionOfInstallations =
        mongo.collection<StoredInstallation>("installations");
      const id =
        installQuery.isEnterpriseInstall &&
        installQuery.enterpriseId !== undefined
          ? installQuery.enterpriseId
          : installQuery.teamId;
      if (!id)
        throw new Error(`Unable to find installation id from install query`);
      const installation = (await collectionOfInstallations.findOne({ id }))
        ?.installation;
      close();
      if (installation) return installation;
      throw new Error(`Installation of id ${id} not found`);
    },
  },
});

export const installUrl = installer.generateInstallUrl({
  scopes: [
    "channels:join",
    "channels:read",
    "chat:write",
    "commands",
    "incoming-webhook",
  ],
});
