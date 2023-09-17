import redis from 'redis';

export default class redisService {
    constructor() {
        this.redisClient = redis.createClient();

        this.connectClient();
        this.addErrorHandler();
        this.addConnectOnMessage();

        return this.redisClient;
    }

    async connectClient() {
        await this.redisClient.connect().catch(console.error);
    }

    addErrorHandler() {
        this.redisClient.on('error', function (err) {
            console.log('Could not establish a connection with redis. ' + err);
        });
    }

    addConnectOnMessage() {
        this.redisClient.on('connect', function (err) {
            console.log('Connected to redis successfully');
        });
    }

}