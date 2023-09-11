import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.ATLAS_URI;

let database;
const dbName = "mybitly";
const collectionName = "links";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const dbService = {};

dbService.insertOne = async (value) => {
    try {
        const insertOneResult = await collection.insertOne(value);
        console.log(`${insertOneResult.insertedCount} document successfully inserted.\n`);
    } catch (err) {
        console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
    }
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

dbService.connect = () => {
    async function run() {
        try {
            await client.connect();
            database = client.db(dbName);
            // Send a ping to confirm a successful connection
            await client.db(dbName).command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    }
    run().catch(console.dir);
}

export default dbService;