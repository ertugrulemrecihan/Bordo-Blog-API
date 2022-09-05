const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ApiError = require('../scripts/responses/error/apiError');

const paramIdValidator = (req, res, next) => {
    const keyList = Object.keys(req.params);

    // Key değerinde 'id' içeren value'lerin ObjectId olduğunu doğrula
    for (let i = 0; i < keyList.length; i++) {
        const key = keyList[i];
        const value = req.params[key];

        if (
            key.toLowerCase().includes('id') &&
            !mongoose.Types.ObjectId.isValid(value)
        ) {
            throw new ApiError(
                'Parameters contain invalid ID',
                httpStatus.BAD_REQUEST
            );
        }
    }

    return next();
};

module.exports = paramIdValidator;
