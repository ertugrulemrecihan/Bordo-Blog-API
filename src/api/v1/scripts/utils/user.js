const jwtHelper = require('./jwt');
const emailVerificationTokenService = require('../../services/EmailVerificationTokenService');
const httpStatus = require('http-status');
const userService = require('../../services/UserService');
const ApiError = require('../../responses/error/apiError');
const eventEmitter = require('../events/eventEmitter');
const ApiSuccess = require('../../responses/success/apiSuccess');

const createResponse = (user) => {
    const userObject = deletePasswordAndSaltFields(user);

    return {
        ...userObject,
        tokens: {
            access: jwtHelper.generateAccessToken(userObject),
            refresh: jwtHelper.generateRefreshToken(userObject),
        }
    };
};

const deletePasswordAndSaltFields = (user) => {
    const newObject = user.toObject();

    delete newObject.password;
    delete newObject.salt;

    return newObject;
};

const createAndVerifyEmail = async (email) => {
    const user = await userService.fetchOneByQuery({ email: email });
    if (!user) throw new ApiError('No user found associated with this email', httpStatus.NOT_FOUND);
    if (user.email_verified) throw new ApiError('User\'s email address is already verified', httpStatus.BAD_REQUEST);

    const currentVerifyToken = await emailVerificationTokenService.fetchOneByQuery({ user: user._id });
    if (currentVerifyToken) await emailVerificationTokenService.deleteById(currentVerifyToken._id);


    const jwtUser = deletePasswordAndSaltFields(user);
    const emailVerifyToken = jwtHelper.generateEmailVerifyToken(jwtUser);

    await emailVerificationTokenService.create({
        user_id: user._id,
        token: emailVerifyToken
    });

    const verifyUrl = emailVerifyToken;

    eventEmitter.emit('send_email', {
        to: user.email,
        subject: 'Email Verification',
        template: 'emailVerify',
        context: {
            fullName: user.first_name + ' ' + user.last_name,
            validationUrl: verifyUrl,
            expires: process.env.JWT_EMAIL_VERIFY_EXP,
        }
    });

    return new ApiSuccess('Email verification link successfully sent to email', httpStatus.OK);
};

module.exports = {
    createResponse,
    deletePasswordAndSaltFields,
    createAndVerifyEmail
};