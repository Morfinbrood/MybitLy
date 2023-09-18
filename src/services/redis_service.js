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
            console.error('RedisService: redisClient.connect() ' + error);
            throw new Error(`RedisService:connectClient  ${error}`);
        }
    }

    addErrorHandler() {
        this.redisClient.on('error', function (error) {
            console.error('ERROR: RedisService: redisClient.on ' + error);
        });
    }

    addConnectOnMessage() {
        this.redisClient.on('connect', function () {
            console.error('Connected to redis successfully');
        });
    }

    async getCashedData(key) {
        try {
            const getCashedDataResult = await this.redisClient.get(key);
            console.log(`Successfull get cashed data from Redis with ${key}  data: ${getCashedDataResult}`);
            return getCashedDataResult;
        } catch (error) {
            console.error(`Something went wrong redisService getRedisCashData: ${error}`);
            throw new Error(`RedisService:getCashedData  ${error}`);
        }
    }

    async setCashData(key, data, cashTime) {
        try {
            const addDataToRedisCashResult = await this.redisClient.set(key, data, { EX: cashTime, NX: true });
            console.log(`Successfull set cashed data from Redis data ${{ key, data, cashTime }}`);
            return addDataToRedisCashResult;
        } catch (error) {
            console.error(`Something went wrong redisService  cashRedisData: ${error}`);
            throw new Error(`RedisService:setCashData  ${error}`);
        }
    }
}