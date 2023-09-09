export function redisClientOnMessages(redisClient) {
    redisClient.on('error', function (err) {
        console.log('Could not establish a connection with redis. ' + err);
    });
    redisClient.on('connect', function (err) {
        console.log('Connected to redis successfully');
    });
}