const httpStatus = require('http-status');
const tagService = require('../services/tag.service');
const BaseController = require('./base.controller');
const ApiError = require('../scripts/responses/error/apiError');
// eslint-disable-next-line max-len
const ApiDataSuccess = require('../scripts/responses/success/apiDataSuccess');
const redisHelper = require('../scripts/helpers/redis.helper');
const paginationHelper = require('../scripts/helpers/pagination.helper');

class TagController extends BaseController {
    constructor() {
        super(tagService);
    }

    // Override
    create = async (req, res, next) => {
        req.body.post_count = 0;
        try {
            const response = await tagService.create(req.body);

            if (!response) {
                return next(
                    new ApiError(
                        'Tag creation failed',
                        httpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }

            await redisHelper.removeByClassName(this.constructor.name);

            ApiDataSuccess.send(
                response,
                'Tag created successfully',
                httpStatus.CREATED,
                res
            );
        } catch (err) {
            if (err.code === 11000) {
                return next(
                    new ApiError('Tag already exists', httpStatus.CONFLICT)
                );
            }

            return next(
                new ApiError(
                    'Tag creation failed',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }
    };

    // Override
    fetchAll = async (req, res, next) => {
        const tags = await tagService.fetchAll({
            queryOptions: req?.queryOptions,
        });

        if (tags.length > 0) {
            await redisHelper.cache(req, tags);
        }

        const response = {
            tags,
        };

        if (req?.queryOptions?.pagination?.limit) {
            const totalItemCount = await tagService.count();

            const paginationInfo = paginationHelper.getPaginationInfo(
                totalItemCount,
                req.queryOptions.pagination?.limit,
                req.queryOptions.pagination?.page
            );

            if (paginationInfo.error) {
                return next(
                    new ApiError(
                        paginationInfo.error.message,
                        paginationInfo.error.code
                    )
                );
            }

            response.paginationInfo = paginationInfo.data;
        }

        ApiDataSuccess.send(
            response,
            'Tags fetched successfully',
            httpStatus.OK,
            res
        );
    };

    fetchAllMostUsedTags = async (req, res, next) => {
        const count = parseInt(req.params.count);
        if (!count || count <= 0) {
            return next(
                new ApiError(
                    'You must send an integer greater than 0 as a parameter',
                    httpStatus.BAD_REQUEST
                )
            );
        }

        const tags = await tagService.fetchAll({ sortQuery: '-post_count' });
        const totalUsageCount = tags.reduce(
            (partialSum, tag) => partialSum + tag.post_count,
            0
        );

        const tagsWithPercentile = tags.slice(0, count).map((tag) => ({
            tag: tag,
            percentile:
                totalUsageCount > 0
                    ? (100 * tag.post_count) / totalUsageCount
                    : 0,
        }));

        if (tagsWithPercentile.length > 0) {
            await redisHelper.cache(req, tagsWithPercentile);
        }

        ApiDataSuccess.send(
            tagsWithPercentile,
            'Tags fetched successfully',
            httpStatus.OK,
            res
        );
    };
}

module.exports = new TagController();
