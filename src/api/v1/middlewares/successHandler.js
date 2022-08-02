const ApiSuccess = require('../responses/success/apiSuccess');
const ApiDataSuccess = require('../responses/success/apiDataSuccess');

const successHandler = (req, res, next) => {
    if (res.locals.apiResponse) {
        const response = res.locals.apiResponse;
        const resJson = {
            message: response.message,
            statusCode: response.statusCode
        };
        if (response instanceof ApiSuccess) {
            return res.json(resJson);
        } else if (response instanceof ApiDataSuccess) {
            resJson.data = response.data;
            return res.json(resJson);
        }
    } else {
        return next();
    }
};

module.exports = successHandler;