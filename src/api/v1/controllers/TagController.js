const httpStatus = require('http-status');
const tagService = require('../services/TagService');
const BaseController = require('./BaseController');
const paginationHelper = require('../scripts/utils/pagination');
const ApiError = require('../responses/error/apiError');
const ApiDataSuccess = require('../responses/success/apiDataSuccess');
const redisHelper = require('../scripts/utils/redis');

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
                res,
                next
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

    async fetchAllMostUsedTags(req, res, next) {
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
            res,
            next
        );
    }

    async fetchAllTagsWithSortByQuery(req, res, next) {
        const fieldName = req.query.fieldName;

        const fields = Object.keys(tagService.model.schema.paths);

        const isExistField = paginationHelper.isValidSortField(
            fieldName,
            fields
        );

        if (!isExistField) {
            return next(
                new ApiError(
                    'The field specified in the query was not found',
                    httpStatus.NOT_FOUND
                )
            );
        }

        const tags = await tagService.fetchAll({ sortQuery: fieldName });

        if (tags.length > 0) {
            await redisHelper.cache(req, tags);
        }

        ApiDataSuccess.send(
            tags,
            'Posts fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async fetchAllTagsByLimit(req, res, next) {
        const fieldName = req.query?.fieldName;

        if (fieldName) {
            const fields = Object.keys(tagService.model.schema.paths);

            const isExistField = paginationHelper.isValidSortField(
                fieldName,
                fields
            );

            if (!isExistField) {
                return next(
                    new ApiError(
                        'The field specified in the query was not found',
                        httpStatus.NOT_FOUND
                    )
                );
            }
        }

        const pageSize =
            req.query.limit < 1 ? 10 : parseInt(req.query.limit) || 10;
        const pageNumber =
            req.query.page < 1 ? 1 : parseInt(req.query.page) || 1;
        const startPage = (pageNumber - 1) * pageSize;

        const tags = await tagService.fetchAll({
            sortQuery: fieldName,
            limit: pageSize,
            skip: startPage,
        });

        if (tags.length > 0) {
            await redisHelper.cache(req, tags);
        }

        const totalItemCount = await tagService.count();

        const paginationInfo = paginationHelper.getPaginationInfo(
            totalItemCount,
            pageSize,
            pageNumber
        );

        if (paginationInfo.error) {
            return next(
                new ApiError(
                    paginationInfo.error.message,
                    paginationInfo.error.code
                )
            );
        }

        const response = {
            paginationInfo: paginationInfo.data,
            tags,
        };

        ApiDataSuccess.send(
            response,
            'Tags fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }
}

module.exports = new TagController();
