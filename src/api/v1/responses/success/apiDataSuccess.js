const ApiSuccess = require('./apiSuccess');

class ApiDataSuccess extends ApiSuccess {
    static toJSON(data, message, statusCode) {
        const successResponse = ApiSuccess.toJSON(message, statusCode);

        return {
            ...successResponse,
            data,
        };
    }

    static send(data, message, statusCode, res, next) {
        ApiDataSuccess.place(data, message, statusCode, res);
        next();
    }

    static place(data, message, statusCode, res) {
        res.locals.apiResponse = ApiDataSuccess.toJSON(
            data,
            message,
            statusCode
        );
    }
}

module.exports = ApiDataSuccess;
