class ApiSuccess {
    static toJSON(message, statusCode) {
        return {
            message,
            success: true,
            statusCode,
        };
    }

    static send(message, statusCode, res, next) {
        res.locals.apiResponse = ApiSuccess.toJSON(message, statusCode);
        next();
    }
}

module.exports = ApiSuccess;
