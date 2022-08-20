const successHandler = (req, res, next) => {
    if (res.locals.apiResponse) {
        const response = res.locals.apiResponse;
        return res.status(response.statusCode).json(response);
    }

    next();
};

module.exports = successHandler;
