/* eslint-disable max-len */
const jwtHelper = require('./jwt');
const emailVerificationTokenService = require('../../services/EmailVerificationTokenService');
const httpStatus = require('http-status');
const userService = require('../../services/UserService');
const ApiError = require('../../responses/error/apiError');
const eventEmitter = require('../events/eventEmitter');
const accessTokenService = require('../../services/AccessTokenService');
const refreshTokenService = require('../../services/RefreshTokenService');

const createResponse = (user) => {
    const userObject = deleteProfile(user);

    return {
        access_token: jwtHelper.generateAccessToken(userObject),
        refresh_token: jwtHelper.generateRefreshToken(userObject),
    };
};

const deleteProfile = (user) => {
    const userObject = deletePasswordAndSaltFields(user);

    delete userObject.avatar;
    delete userObject.first_name;
    delete userObject.last_name;
    delete userObject.last_login;
    delete userObject.email_notification;
    delete userObject.plan;

    return userObject;
};

const deletePasswordAndSaltFields = (user) => {
    const newObject = user.toObject();

    delete newObject.password;
    delete newObject.salt;

    return newObject;
};

const createAndVerifyEmail = async (email) => {
    const user = await userService.fetchOneByQuery({ email: email });
    if (!user) {
        throw new ApiError(
            'No user found associated with this email',
            httpStatus.NOT_FOUND
        );
    }
    if (user.email_verified) {
        throw new ApiError(
            "User's email address is already verified",
            httpStatus.BAD_REQUEST
        );
    }

    const currentVerifyToken =
        await emailVerificationTokenService.fetchOneByQuery({ user: user._id });
    if (currentVerifyToken) {
        await emailVerificationTokenService.deleteById(currentVerifyToken._id);
    }

    const jwtUser = deletePasswordAndSaltFields(user);
    const emailVerifyToken = jwtHelper.generateEmailVerifyToken(jwtUser);

    await emailVerificationTokenService.create({
        user_id: user._id,
        token: emailVerifyToken,
    });

    const verifyUrl =
        process.env.NODE_ENV == 'PRODUCTION'
            ? `${process.env.API_URL}/users/verify-email/${emailVerifyToken}`
            : `${process.env.API_URL}:${process.env.PORT}/api/v1/users/verify-email/${emailVerifyToken}`;

    eventEmitter.emit('send_email', {
        to: user.email,
        subject: 'Email Verification',
        template: 'emailVerify',
        context: {
            fullName: user.first_name + ' ' + user.last_name,
            validationUrl: verifyUrl,
            expires: process.env.JWT_EMAIL_VERIFY_EXP,
        },
    });

    return {
        message: 'Email verification link successfully sent to email',
        statusCode: httpStatus.OK,
    };
};

const logOut = async (userId) => {
    const deletedAccessTokenResult = await accessTokenService.deleteByQuery({
        user: userId,
    });
    const deletedRefreshTokenResult = await refreshTokenService.deleteByQuery({
        user: userId,
    });

    return !deletedAccessTokenResult || !deletedRefreshTokenResult;
};

module.exports = {
    createResponse,
    deletePasswordAndSaltFields,
    createAndVerifyEmail,
    logOut,
};
