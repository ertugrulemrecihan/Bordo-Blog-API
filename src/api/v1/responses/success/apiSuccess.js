class ApiSuccess {
    constructor(message, statusCode) {
        this.message = message;
        this.statusCode = statusCode;
    }

    place(res) {
        res.locals.apiResponse = this;
    }
}

module.exports = ApiSuccess;
