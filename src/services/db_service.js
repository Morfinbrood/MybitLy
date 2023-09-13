import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.ATLAS_URI;
const dbName = "mybitly";
const collectionLinks = "links";

const dbService = {};

dbService.connect = async () => {
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });
    try {
        await client.connect();
        console.log('connection opened');
        return client;
    } catch (err) {
        console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
    }

}

dbService.closeConnection = async (client) => {
    try {
        await client.close();
        console.log('connection closed');
    } catch (err) {
        console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
        return false;
    }
}


dbService.insertLink = async (userSession, link) => {
    const client = await dbService.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionLinks);
    const sessionRecord = {
        creatorSession: userSession,
        links: [link, "/nodejs.org"]
    }
    try {
        const insertOneResult = await collection.insertOne(sessionRecord);
        console.log(`${insertOneResult.insertedCount} document successfully inserted.\n`);
        return true;
    } catch (err) {
        console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
        return false;
    } finally {
        await dbService.closeConnection(client);
    }
}

dbService.findLink = async () => {
    return false;
}

dbService.isSessionActive = async (session) => {
    const findOneQuery = { session: session };

    try {
        const findOneResult = await collection.findOne(findOneQuery);
        if (findOneResult === null) {
            console.log("Session no exist\n");
            return false;
        } else {
            console.log(`Session exist`);
            return true;
        }
    } catch (err) {
        console.error(`Something went wrong trying to find session:${session}  err:${err}\n`);
    }

}

export default dbService;