const ApiSuccess = require('./apiSuccess');

class ApiDataSuccess extends ApiSuccess {
    constructor(data, message, statusCode) {
        super(message, statusCode);
        this.data = data;
    }
}

module.exports = ApiDataSuccess;
