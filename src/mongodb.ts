import { Db, MongoClient } from "mongodb";

export const connect = async (): Promise<[Db, MongoClient["close"]]> => {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("DATABASE_URL is not defined");
  }
  try {
    const client = await new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).connect();
    const safeClose = async () => {
      try {
        return client.close();
      } catch (error) {
        console.error(error);
        return;
      }
    };
    return [client.db("snackatron"), safeClose];
  } catch (error) {
    throw new Error(
      `There was an issue attempting to connect to ${uri}\n${error}`
    );
  }
};
