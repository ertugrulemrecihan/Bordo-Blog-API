class ApiSuccess {
    static toJSON(message, statusCode) {
        return {
            message,
            success: true,
            statusCode,
        };
    }

    static send(message, statusCode, res) {
        return res
            .status(statusCode)
            .json(ApiSuccess.toJSON(message, statusCode));
    }
}

module.exports = ApiSuccess;
