import redis from 'redis';

export default class RedisService {
    constructor() {
        this.redisClient = redis.createClient();
        this.connectClient();
        this.addErrorHandler();
        this.addConnectOnMessage();
    }

    getRedisClient() {
        return this.redisClient
    }

    async connectClient() {
        try {
            await this.redisClient.connect().catch(console.error);
        } catch (error) {
            console.error('RedisService: redisClient.connect() ' + err);
        }
    }

    addErrorHandler() {
        this.redisClient.on('error', function (err) {
            console.error('ERROR: RedisService: redisClient.on ' + err);
        });
    }

    addConnectOnMessage() {
        this.redisClient.on('connect', function (err) {
            console.error('Connected to redis successfully');
        });
    }

    async getCashedData(key) {
        try {
            const getCashedDataResult = await this.redisClient.get(key);
            console.log(`Successfull get cashed data from Redis with ${key}  data: ${getCashedDataResult}\n`);
            return getCashedDataResult;
        } catch (err) {
            console.error(`Something went wrong redisService getRedisCashData: ${err}\n`);
        }
    }

    async setCashData(key, data, cashTime) {
        try {
            const addDataToRedisCashResult = await this.redisClient.set(key, data, { EX: cashTime, NX: true });
            console.log(`Successfull set cashed data from Redis data ${{ key, data, cashTime }}\n`);
            return addDataToRedisCashResult;
        } catch (err) {
            console.error(`Something went wrong redisService  cashRedisData: ${err}\n`);
        }
    }

}