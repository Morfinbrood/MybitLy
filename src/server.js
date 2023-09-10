import { } from 'dotenv/config'

import express from "express";
import session from "express-session";
import redis from 'redis';
import redisStorage from 'connect-redis';

import recordRoutes from './routes/routes.js'
import dbService from './db_service/db_service.js'


const redisClient = redis.createClient();
redisClient.connect().catch(console.error);

redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});

const app = express()

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(process.env.EXPRESS_PORT, process.env.EXPRESS_HOST, function () {
    console.log(`Server listens http://${process.env.EXPRESS_PORT}:${process.env.EXPRESS_HOST}`);
});

app.use(recordRoutes);

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


dbService.connect();