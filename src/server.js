import { } from 'dotenv/config'

import express from "express";
import session from "express-session";
import redisStorage from 'connect-redis';

import recordRoutes from './routes/routes.js'
import dbService from './services/db_service.js'
import redisService from './services/redis_service.js';


const redisClient = redisService.startClient();

const app = express()

app.listen(process.env.EXPRESS_PORT, process.env.EXPRESS_HOST, function () {
    console.log(`Server listens http://${process.env.EXPRESS_PORT}:${process.env.EXPRESS_HOST}`);
});

app.use(
    session({
        store: new redisStorage({
            host: process.env.EXPRESS_HOST,
            port: process.env.REDIS_STORAGE_PORT,
            resave: true,
            saveUninitialized: true,
            client: redisClient,
            ttl: process.env.REDIS_STORAGE_TTL,
        }),
        secret: 'you secret key',
        saveUninitialized: true,
    })
);

app.use(recordRoutes);

dbService.connect();