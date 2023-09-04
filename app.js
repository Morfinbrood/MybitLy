import express from "express";
import session from "express-session";
import redisStorage from 'connect-redis';
import redis from 'redis';

const client = redis.createClient();
client.connect().catch(console.error);

const app = express()
const host = '127.0.0.1';
const port = 7000;

app.get('/:subpart', (req, res) => {
    console.log("subpart: " + req.params["subpart"]);
    res.send("subpart: " + req.params["subpart"])
    res.sendStatus(200);
});

app.listen(port, host, function () {
    console.log(`Server listens http://${host}:${port}`);
});

app.use(
    session({
        store: new redisStorage({
            host: host,
            port: 6379,
            client: client,
            prefix: "MybitLy",
            ttl: 3600000,
        }),
        secret: 'you secret key',
        saveUninitialized: true,
    })
);