import redis from 'redis';

const redisService = {};

redisService.startClient = () => {
    const redisClient = redis.createClient();
    redisClient.connect().catch(console.error);

    redisClient.on('error', function (err) {
        console.log('Could not establish a connection with redis. ' + err);
    });
    redisClient.on('connect', function (err) {
        console.log('Connected to redis successfully');
    });
    return redisClient;
}


export default redisService;