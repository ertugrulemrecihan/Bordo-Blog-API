const httpStatus = require('http-status');
const JWT = require('jsonwebtoken');
const ApiError = require('../responses/error/apiError');
const accessTokenService = require('../services/AccessTokenService');

const authenticate = async (req, res, next) => {
    const token = req.headers?.authorization?.split(' ')[1];
    if (!token) return next(new ApiError('Access denied', httpStatus.UNAUTHORIZED));

    const currentAccessToken = await accessTokenService.fetchOneByQuery({ token: token });

    if (!currentAccessToken) return next(new ApiError('Invalid access token', httpStatus.BAD_REQUEST));

    if (currentAccessToken.token != token) return next(new ApiError('Invalid access token', httpStatus.BAD_REQUEST));

    JWT.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) return next(new ApiError('Invalid access token', httpStatus.BAD_REQUEST));

        if (decoded.data._id != currentAccessToken.user) return next(new ApiError('Invalid access token', httpStatus.BAD_REQUEST));

        req.user = decoded.data;

        if (!req.user.email_verified) return next(new ApiError('User email is not verified', httpStatus.FORBIDDEN));

        next();
    });
};

module.exports = authenticate;