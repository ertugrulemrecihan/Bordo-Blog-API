const client = require('../api/v1/scripts/redis/redis-client');
const redisHelper = require('../api/v1/scripts/helpers/redis.helper');

let showErrorMessage = true;
let showDisconnectedMessage = true;

client.on('ready', async () => {
    try {
        await client.ping();
        showDisconnectedMessage = true;
        console.log('Connected to Redis');
        redisHelper.removeByPattern(`${process.env.APP_NAME}.*`);
    } catch (error) {
        if (showDisconnectedMessage) {
            console.log('Disconnected to Redis');
            showDisconnectedMessage = false;
        }
    }
});

client.on('error', async () => {
    if (showErrorMessage) {
        console.log('Redis connection failed');
        showErrorMessage = false;
    }
});

const connectRedis = async () => {
    client.connect();
};

module.exports = () => {
    connectRedis();
};
