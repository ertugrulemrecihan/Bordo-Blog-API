const redis = require('redis');

const client = redis.createClient({
    socket: {
        host: 'localhost',
        port: '6379',
        reconnectStrategy: () => {
            return process.env.REDIS_RECONNECT_TIMEOUT * 1000;
        },
    },
});

module.exports = client;
