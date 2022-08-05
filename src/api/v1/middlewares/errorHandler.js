const httpStatus = require('http-status');
const ApiError = require('../responses/error/apiError');

// eslint-disable-next-line no-unused-vars
const ErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        const apiError = {
            error: {
                message: err.message || 'Something went wrong',
            },
            success: false,
        };
        return res.status(err.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json(apiError);
    }

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        error: {
            message: 'Internal Server Error',
        },
        success: false,
    });
};

module.exports = ErrorHandler;
