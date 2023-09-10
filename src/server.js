import { EXPRESS_HOST, EXPRESS_PORT } from "./constants/constants.js";

import express from "express";
import redis from 'redis';
import { addRedisClientInitMessage } from './redis/utils.js';
import * as expressUse from './express/middleware.js'
import * as expressGet from './express/routes.js'

const redisClient = redis.createClient();
redisClient.connect().catch(console.error);

addRedisClientInitMessage(redisClient);
const app = express()

app.listen(EXPRESS_PORT, EXPRESS_HOST, function () {
    console.log(`Server listens http://${EXPRESS_HOST}:${EXPRESS_PORT}`);
});

expressUse.addExpressErrorHandler(app);
expressUse.addExpressIgnoreFavicon(app);
expressUse.addRedisSession(app, redisClient);

expressGet.addHomepageRoute(app, '/');
expressGet.addSubpartsRoute(app, '/:subpart');