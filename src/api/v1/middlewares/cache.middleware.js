const httpStatus = require('http-status');
// eslint-disable-next-line max-len
const ApiDataSuccess = require('../scripts/responses/success/apiDataSuccess');
const client = require('../scripts/redis/redis-client');
const redisHelper = require('../scripts/helpers/redis.helper');
const successHandler = require('./success-handler.middleware');

const cache = (controller) => async (req, res, next) => {
    if (client.isReady) {
        const controllerName = controller.constructor.name;
        req.controllerName = controllerName;
        const cachedData = await redisHelper.getCache(req);
        if (cachedData) {
            const message = Array.isArray(cachedData)
                ? `${controller.pluralModelName} fetched successfully c`
                : `${controller.singleModelName} fetched successfully c`;
            ApiDataSuccess.place(cachedData, message, httpStatus.OK, res);
            return successHandler(req, res, next);
        }
        return next();
    } else {
        return next();
    }
};

module.exports = cache;
