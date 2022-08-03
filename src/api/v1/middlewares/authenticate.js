const httpStatus = require('http-status');
const JWT = require('jsonwebtoken');
const ApiError = require('../responses/error/apiError');

const authenticate = (req, res, next) => {
    const token = req.headers?.authorization?.split(' ')[1];
    if (!token) return next(new ApiError('Access denied', httpStatus.UNAUTHORIZED));

    JWT.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) return next(new ApiError('Invalid token', httpStatus.UNAUTHORIZED));

        console.log('decoded :>> ', decoded);

        req.user = decoded.data;
        next();
    });
};

module.exports = authenticate;