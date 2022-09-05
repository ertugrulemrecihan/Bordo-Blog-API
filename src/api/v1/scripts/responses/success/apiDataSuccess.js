const ApiSuccess = require('./apiSuccess');

class ApiDataSuccess extends ApiSuccess {
    static toJSON(data, message, statusCode) {
        const successResponse = ApiSuccess.toJSON(message, statusCode);

        return {
            ...successResponse,
            data,
        };
    }

    static send(data, message, statusCode, res) {
        return res
            .status(statusCode)
            .json(ApiDataSuccess.toJSON(data, message, statusCode));
    }
}

module.exports = ApiDataSuccess;
