const httpStatus = require('http-status');
const TagService = require('../services/TagService');
const BaseController = require('./BaseController');
const ApiError = require('../responses/error/apiError');
const ApiDataSuccess = require('../responses/success/apiDataSuccess');

class TagController extends BaseController {
    constructor() {
        super(TagService);
    }

    // Override
    create = async (req, res, next) => {
        req.body.post_count = 0;
        try {
            const response = await TagService.create(req.body);

            if (!response) {
                return next(
                    new ApiError('Tag creation failed', httpStatus.BAD_REQUEST)
                );
            }

            new ApiDataSuccess(
                response,
                'Tag created successfully',
                httpStatus.OK
            ).place(res);

            return next();
        } catch (err) {
            if (err.code === 11000) {
                return next(
                    new ApiError('Tag already exists', httpStatus.CONFLICT)
                );
            }
            return next(
                new ApiError('Tag creation failed', httpStatus.BAD_REQUEST)
            );
        }
    };
}

module.exports = new TagController();
