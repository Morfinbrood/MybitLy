import { } from 'dotenv/config'

import express from "express";
import session from "express-session";
import redisStorage from 'connect-redis';
import { REDIS_STORAGE_TTL } from './constants/constants.js';

import RecordRoutes from './routes/routes.js'
import RedisService from './services/redis_service.js';


try {
    const redisService = new RedisService();
    const redisClient = redisService.getRedisClient();

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
                ttl: REDIS_STORAGE_TTL,
            }),
            secret: process.env.SECRET_KEY,
            saveUninitialized: true,
        })
    );

    const addAllrecordRoutes = new RecordRoutes();
    app.use(addAllrecordRoutes);
} catch (err) {
    console.error(`Something went wrong with server  err:${err}\n`);
}
