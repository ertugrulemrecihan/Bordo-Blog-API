// eslint-disable-next-line max-len
const ApiDataSuccess = require('../scripts/responses/success/apiDataSuccess');
const ApiError = require('../scripts/responses/error/apiError');
const httpStatus = require('http-status');
const redisHelper = require('../scripts/helpers/redis.helper');

class BaseController {
    constructor(service) {
        this.service = service;

        const singleModelName = this.service.model.modelName;
        const pluralModelName = this.service.model.collection.name;

        // Capitalize first letters
        this.singleModelName =
            singleModelName.charAt(0).toUpperCase() + singleModelName.slice(1);
        this.pluralModelName =
            pluralModelName.charAt(0).toUpperCase() + pluralModelName.slice(1);
    }

    fetchAll = async (req, res) => {
        const response = await this.service.fetchAll();

        if (response.length > 0) {
            await redisHelper.cache(req, response);
        }

        ApiDataSuccess.send(
            response,
            `${this.pluralModelName} fetched successfully`,
            httpStatus.OK,
            res
        );
    };

    fetchAllByQuery = async (req, res) => {
        const response = await this.service.fetchAll({ query: req.query });

        if (response.length > 0) {
            await redisHelper.cache(req, response);
        }

        ApiDataSuccess.send(
            response,
            `${this.pluralModelName} fetched successfully`,
            httpStatus.OK,
            res
        );
    };

    fetchOneByQuery = async (req, res, next) => {
        const response = await this.service.fetchOneByQuery(req.query);

        if (!response) {
            return next(
                new ApiError(
                    `${this.singleModelName} not found`,
                    httpStatus.NOT_FOUND
                )
            );
        }

        await redisHelper.cache(req, response);

        ApiDataSuccess.send(
            response,
            `${this.singleModelName} fetched successfully`,
            httpStatus.OK,
            res
        );
    };

    fetchOneByParamsId = async (req, res, next) => {
        const response = await this.service.fetchOneById(req.params.id);

        if (!response) {
            return next(
                new ApiError(
                    `${this.singleModelName} not found`,
                    httpStatus.NOT_FOUND
                )
            );
        }

        await redisHelper.cache(req, response);

        ApiDataSuccess.send(
            response,
            `${this.singleModelName} fetched successfully`,
            httpStatus.OK,
            res
        );
    };

    create = async (req, res, next) => {
        try {
            const response = await this.service.create(req.body);

            if (!response) {
                return next(
                    new ApiError(
                        `${this.singleModelName} creation failed`,
                        httpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }

            await redisHelper.removeByClassName(this.constructor.name);

            ApiDataSuccess.send(
                response,
                `${this.singleModelName} created successfully`,
                httpStatus.CREATED,
                res
            );
        } catch (err) {
            if (err.code === 11000) {
                return next(
                    new ApiError(
                        `${this.singleModelName} already exists`,
                        httpStatus.CONFLICT
                    )
                );
            }

            return next(
                new ApiError(
                    `${this.singleModelName} creation failed`,
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }
    };

    updateByQuery = async (req, res, next) => {
        try {
            const response = await this.service.updateByQuery(
                req.query,
                req.body
            );

            if (!response) {
                return next(
                    new ApiError(
                        `${this.singleModelName} not found`,
                        httpStatus.NOT_FOUND
                    )
                );
            }

            await redisHelper.removeByClassName(this.constructor.name);

            ApiDataSuccess.send(
                response,
                `${this.singleModelName} updated successfully`,
                httpStatus.OK,
                res
            );
        } catch (err) {
            if (err.code === 11000) {
                return next(
                    new ApiError(
                        `${this.singleModelName} already exists`,
                        httpStatus.CONFLICT
                    )
                );
            }

            return next(
                new ApiError(
                    `${this.singleModelName} update failed`,
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }
    };

    updateByParamsId = async (req, res, next) => {
        try {
            const response = await this.service.updateById(
                req.params.id,
                req.body
            );

            if (!response) {
                return next(
                    new ApiError(
                        `${this.singleModelName} not found`,
                        httpStatus.NOT_FOUND
                    )
                );
            }

            await redisHelper.removeByClassName(this.constructor.name);

            ApiDataSuccess.send(
                response,
                `${this.singleModelName} updated successfully`,
                httpStatus.OK,
                res
            );
        } catch (err) {
            if (err.code === 11000) {
                return next(
                    new ApiError(
                        `${this.singleModelName} already exists`,
                        httpStatus.CONFLICT
                    )
                );
            }

            return next(
                new ApiError(
                    `${this.singleModelName} update failed`,
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }
    };

    deleteByQuery = async (req, res, next) => {
        const response = await this.service.deleteByQuery(req.query);

        if (!response) {
            return next(
                new ApiError(
                    `${this.singleModelName} not found`,
                    httpStatus.NOT_FOUND
                )
            );
        }

        await redisHelper.removeByClassName(this.constructor.name);

        ApiDataSuccess.send(
            response,
            `${this.singleModelName} deleted successfully`,
            httpStatus.OK,
            res
        );
    };

    deleteByParamsId = async (req, res, next) => {
        const response = await this.service.deleteById(req.params.id);

        if (!response) {
            return next(
                new ApiError(
                    `${this.singleModelName} not found`,
                    httpStatus.NOT_FOUND
                )
            );
        }

        await redisHelper.removeByClassName(this.constructor.name);

        ApiDataSuccess.send(
            response,
            `${this.singleModelName} deleted successfully`,
            httpStatus.OK,
            res
        );
    };
}

module.exports = BaseController;
