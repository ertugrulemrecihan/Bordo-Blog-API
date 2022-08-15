const ApiDataSuccess = require('../responses/success/apiDataSuccess');
const ApiError = require('../responses/error/apiError');
const httpStatus = require('http-status');

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

    fetchAll = async (req, res, next) => {
        const response = await this.service.fetchAll();

        new ApiDataSuccess(
            response,
            `${this.pluralModelName} fetched successfully`,
            httpStatus.OK
        ).place(res);

        return next();
    };

    fetchAllByQuery = async (req, res, next) => {
        const response = await this.service.fetchAll(req.query);

        new ApiDataSuccess(
            response,
            `${this.pluralModelName} fetched successfully`,
            httpStatus.OK
        ).place(res);

        return next();
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

        new ApiDataSuccess(
            response,
            `${this.singleModelName} fetched successfully`,
            httpStatus.OK
        ).place(res);

        return next();
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

        new ApiDataSuccess(
            response,
            `${this.singleModelName} fetched successfully`,
            httpStatus.OK
        ).place(res);

        return next();
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

            new ApiDataSuccess(
                response,
                `${this.singleModelName} created successfully`,
                httpStatus.CREATED
            ).place(res);

            return next();
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

            new ApiDataSuccess(
                response,
                `${this.singleModelName} updated successfully`,
                httpStatus.OK
            ).place(res);

            return next();
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

            new ApiDataSuccess(
                response,
                `${this.singleModelName} updated successfully`,
                httpStatus.OK
            ).place(res);

            return next();
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

        new ApiDataSuccess(
            response,
            `${this.singleModelName} deleted successfully`,
            httpStatus.OK
        ).place(res);

        return next();
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

        new ApiDataSuccess(
            response,
            `${this.singleModelName} deleted successfully`,
            httpStatus.OK
        ).place(res);

        return next();
    };
}

module.exports = BaseController;
