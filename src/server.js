import { } from 'dotenv/config'

import express from "express";
import redis from 'redis';
import { addRedisClientInitMessage } from './redis/utils.js';
import * as expressUse from './express/middleware.js'
import * as expressGet from './express/routes.js'

import { MongoClient, ServerApiVersion } from 'mongodb';



const redisClient = redis.createClient();
redisClient.connect().catch(console.error);

addRedisClientInitMessage(redisClient);
const app = express()

const PORT = process.env.EXPRESS_PORT || 7000;
const HOST = process.env.EXPRESS_HOST || '127.0.0.1';
app.listen(PORT, HOST, function () {
    console.log(`Server listens http://${HOST}:${PORT}`);
});

expressUse.addExpressErrorHandler(app);
expressUse.addExpressIgnoreFavicon(app);
expressUse.addRedisSession(app, redisClient);

expressGet.addHomepageRoute(app, '/');
expressGet.addSubpartsRoute(app, '/:subpart');


const uri = process.env.ATLAS_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);