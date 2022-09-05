const httpStatus = require('http-status');
const ApiError = require('../scripts/responses//error/apiError');

const bodyValidator = (schema) => (req, res, next) => {
    const options = {
        errors: { wrap: { label: "'" } },
        abortEarly: false,
    };

    if (
        Object.keys(req.body || {}).length === 0 &&
        Object.keys(req.files || {}).length === 0
    ) {
        return next(
            new ApiError(
                'Request body must not be empty',
                httpStatus.BAD_REQUEST
            )
        );
    }

    const { error } = schema.validate(req.body, options);

    if (error) {
        const errorMessage = error.details
            .map((detail) => detail.message)
            .join(', ');

        throw new ApiError(errorMessage, httpStatus.BAD_REQUEST);
    }

    next();
};

module.exports = bodyValidator;
