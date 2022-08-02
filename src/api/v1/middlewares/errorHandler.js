const httpStatus = require("http-status");
const ApiError = require("../responses/error/apiError");

// eslint-disable-next-line no-unused-vars
const ErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            error: {
                message: err.message,
                statusCode: err.statusCode,
            },
            success: false,
        });
    } else {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            error: {
                message: "Internal Server Error",
                statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            },
            success: false,
        });
    }
};

module.exports = ErrorHandler;
