// eslint-disable-next-line max-len
const emailVerificationWhiteList = require('../../../configs/email-verification-whitelist.config');
const httpStatus = require('http-status');
const JWT = require('jsonwebtoken');
const ApiError = require('../scripts/responses/error/apiError');
const accessTokenService = require('../services/access-token.service');

const authenticate = async (req, res, next) => {
    const token = req.headers?.authorization?.split(' ')[1];
    if (!token) {
        return next(new ApiError('Access denied', httpStatus.UNAUTHORIZED));
    }

    // ? Kullanıcıyı DB'den getirmek için DB'ye ayrı bir istek atmak yerine
    // ? accessToken DB'den getirilirken population ile kullanıcıyı da
    // ? getiriyoruz. Zaten DB'de accessToken yoksa gelen token bilgisi de
    // ? yanlıştır ve kullanıcıyı getirmemize gerek yoktur.
    const currentAccessToken = await accessTokenService.fetchOneByQuery(
        {
            token: token,
        },
        {
            populate: [
                {
                    path: 'user',
                    populate: [
                        {
                            path: 'roles',
                            select: 'name',
                        },
                        {
                            path: 'plan',
                            select: 'name right_to_view',
                        },
                    ],
                },
            ],
        }
    );

    if (!currentAccessToken || currentAccessToken.token != token) {
        return next(
            new ApiError('Invalid access token', httpStatus.BAD_REQUEST)
        );
    }

    JWT.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) {
            return next(
                new ApiError('Invalid access token', httpStatus.BAD_REQUEST)
            );
        }

        if (decoded.data._id != currentAccessToken.user._id) {
            return next(
                new ApiError('Invalid access token', httpStatus.BAD_REQUEST)
            );
        }

        req.user = currentAccessToken.user;

        // ? Email verification check

        if (emailVerificationWhiteList.includes(req.originalUrl)) {
            return next();
        }

        if (!req.user.email_verified) {
            return next(
                new ApiError('User email is not verified', httpStatus.FORBIDDEN)
            );
        }

        next();
    });
};

module.exports = authenticate;
