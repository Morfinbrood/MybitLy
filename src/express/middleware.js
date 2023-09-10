import session from "express-session";
import redisStorage from 'connect-redis';
import { ignoreFavicon } from './utils.js';
import { EXPRESS_HOST, REDIS_STORAGE_PORT, REDIS_STORAGE_TTL } from "../constants/constants.js";


export function addExpressErrorHandler(expressApp) {
    expressApp.use(function (err, req, res, next) {
        console.error(err.stack)
        res.status(500).send('Something broke!')
    })
}

export function addExpressIgnoreFavicon(expressApp) {
    expressApp.use(ignoreFavicon);
}

export function addRedisSession(expressApp, redisClient) {
    expressApp.use(
        session({
            store: new redisStorage({
                host: EXPRESS_HOST,
                port: REDIS_STORAGE_PORT,
                resave: true,
                saveUninitialized: true,
                client: redisClient,
                ttl: REDIS_STORAGE_TTL,
            }),
            secret: 'you secret key',
            saveUninitialized: true,
        })
    );
}
