const httpStatus = require('http-status');
const ApiError = require('../scripts/responses/error/apiError');

const queryValidator = (...fields) => (req, res, next) => {
    const queryFields = Object.keys(req.query);

    for (const field of fields) {
        if (!queryFields.includes(field)) {
            return next(
                new ApiError(
                    `'${field}' is required in the query`,
                    httpStatus.BAD_REQUEST
                )
            );
        }
    }

    next();
};

module.exports = queryValidator;
