import { EXPRESS_HOST, EXPRESS_PORT, REDIS_STORAGE_PORT, REDIS_STORAGE_TTL } from "./constants/constants.js";

import express from "express";
import session from "express-session";
import redisStorage from 'connect-redis';
import redis from 'redis';

import { ignoreFavicon } from './utils/express/utils.js';
import { redisClientOnMessages } from './utils/redis/utils.js';

const redisClient = redis.createClient();
redisClient.connect().catch(console.error);

redisClientOnMessages(redisClient);

const app = express()

app.listen(EXPRESS_PORT, EXPRESS_HOST, function () {
    console.log(`Server listens http://${EXPRESS_HOST}:${EXPRESS_PORT}`);
});

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.use(ignoreFavicon);
app.use(
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



app.get("/", (req, res) => {
    if (req?.session?.id) {
        res.write(`<h1>Welcome  you session with uid:</h1><br>`);
        res.write(`<h1> ${req.session.id} </h1><br>`);
        res.end(`<h3>This is the Home page</h3>`);
    } else {
        res.end(`<h1>something wrong with gerenate session </h1><br>`)
    }
});


app.get('/:subpart', (req, res) => {
    console.log("subpart: " + req.params["subpart"]);
    res.send("subpart: " + req.params["subpart"])
});

