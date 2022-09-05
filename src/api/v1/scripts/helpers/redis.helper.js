/* eslint-disable no-empty */
const client = require('../redis/redis-client');

const createKey = (req) => {
    // ! FIXME: Method name farklı şekilde alınabilir mi?
    const methodName = req.route.stack[req.route.stack.length - 1].name;

    const redisKey = `${process.env.APP_NAME}.${
        req.controllerName
    }.${methodName}${JSON.stringify(req.query)}${JSON.stringify(
        req.params
    )}${JSON.stringify(req.body)}${
        req.queryOptions ? JSON.stringify(req.queryOptions) : '{}'
    }`;

    return redisKey;
};

const cache = async (req, value) => {
    if (client.isReady) {
        const cacheKey = createKey(req);

        try {
            await client.set(cacheKey, JSON.stringify(value), {
                EX: process.env.REDIS_CACHE_EXP * 60 * 60,
            });
        } catch {}
    }
};

const getCache = async (req) => {
    let cachedData = null;

    if (client.isReady) {
        const cacheKey = createKey(req);
        try {
            cachedData = await client.get(cacheKey);
        } catch {}
    }

    return JSON.parse(cachedData);
};

const removeByPattern = async (pattern) => {
    if (client.isReady) {
        try {
            const keys = await client.keys(pattern);
            await client.del(keys);
        } catch {}
    }
};

const removeByClassName = async (className) => {
    const pattern = `${process.env.APP_NAME}.${className}.*`;

    await removeByPattern(pattern);
};

module.exports = {
    cache,
    getCache,
    removeByPattern,
    removeByClassName,
};
