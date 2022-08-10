const httpStatus = require('http-status');
const service = require('../services/UserService');
const passwordResetTokenService = require('../services/PasswordResetTokenService');
const passwordHelper = require('../scripts/utils/password');
const jwtHelper = require('../scripts/utils/jwt');
const userHelper = require('../scripts/utils/user');
const ApiDataSuccess = require('../responses/success/apiDataSuccess');
const ApiError = require('../responses/error/apiError');
const eventEmitter = require('../scripts/events/eventEmitter');
const ApiSuccess = require('../responses/success/apiSuccess');
const emailVerificationTokenService = require('../services/EmailVerificationTokenService');
const BaseController = require('./BaseController');
const userService = require('../services/UserService');

class UserController extends BaseController {
    constructor() {
        super(userService);
    }

    async register(req, res, next) {
        const { hashedPassword, hashedSalt } = passwordHelper.passwordToHash(req.body.password);

        req.body.password = hashedPassword;
        req.body.salt = hashedSalt;

        try {
            const user = await service.create(req.body);
            const response = userHelper.createResponse(user);

            try {
                await userHelper.createAndVerifyEmail(req.body.email);
            } catch (error) {
                new ApiDataSuccess(response, 'Your registration has been created successfully, but the verification link could not be sent', httpStatus.CREATED).place(res);
                return next();
            }

            new ApiDataSuccess(response, 'Registration successful', httpStatus.CREATED).place(res);
            return next();
        } catch (error) {
            if (error.code === 11000) return next(new ApiError('Email already exists', httpStatus.CONFLICT));
            return next(new ApiError('Registration failed', httpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    async login(req, res, next) {
        const user = await service.fetchOneByQuery({ email: req.body.email });

        if (!user) return next(new ApiError('No user found associated with this email', httpStatus.NOT_FOUND));

        const hashedPassword = passwordHelper.passwordToHashWithSalt(req.body.password, user.salt);
        if (user.password !== hashedPassword) return next(new ApiError('Invalid password', httpStatus.BAD_REQUEST));

        const response = userHelper.createResponse(user);

        new ApiDataSuccess(response, 'Login successful', httpStatus.OK).place(res);
        return next();
    }

    async getPasswordResetEmail(req, res, next) {
        const user = await service.fetchOneByQuery({ email: req.body.email });
        if (!user) return next(new ApiError('No user found associated with this email', httpStatus.NOT_FOUND));

        const currentResetToken = await passwordResetTokenService.fetchOneByQuery({ user_id: user._id });
        if (currentResetToken) await passwordResetTokenService.deleteById(currentResetToken._id);

        const jwtUser = userHelper.deletePasswordAndSaltFields(user);
        const resetToken = jwtHelper.generatePasswordResetToken(jwtUser);

        await passwordResetTokenService.create({
            user_id: user._id,
            token: resetToken
        });

        // ! FIXME - Add frontend password reset page url
        const resetUrl = resetToken;

        eventEmitter.emit('send_email', {
            to: user.email,
            subject: 'Password Reset',
            template: 'passwordReset',
            context: {
                fullName: user.first_name + ' ' + user.last_name,
                resetUrl,
                expires: process.env.JWT_PASSWORD_RESET_EXP,
            }
        });

        new ApiSuccess('Your password reset link has been sent as email', httpStatus.OK).place(res);
        return next();
    }

    async resetPassword(req, res, next) {
        try {
            const decodedToken = jwtHelper.decodePasswordResetToken(req.body.token);

            const user = await service.fetchOneByQuery({ _id: decodedToken.data._id, email: decodedToken.data.email });
            if (!user) throw new Error();

            const currentResetToken = await passwordResetTokenService.fetchOneByQuery({ user_id: user._id });
            if (!currentResetToken) throw new Error();

            if (currentResetToken.token !== req.body.token) throw new Error();

            const { hashedPassword, hashedSalt } = passwordHelper.passwordToHash(req.body.new_password);

            const result = await service.updateById(user._id, {
                password: hashedPassword,
                salt: hashedSalt
            });

            if (!result) return next(new ApiError('Password reset failed', httpStatus.INTERNAL_SERVER_ERROR));

            await passwordResetTokenService.deleteById(currentResetToken._id);

            eventEmitter.emit('send_email', {
                to: user.email,
                subject: 'Password Reset Successful',
                template: 'passwordResetSuccess',
                context: {
                    fullName: user.first_name + ' ' + user.last_name,
                }
            });

            new ApiSuccess('Password has been reset', httpStatus.OK).place(res);
            return next();

        } catch {
            return next(new ApiError('Invalid or expired password reset token', httpStatus.BAD_REQUEST));
        }
    }

    async changePassword(req, res, next) {
        // Validate old password
        const user = await service.fetchOneByQuery({ email: req.user.email });
        if (!user) return next(new ApiError('No user found associated with this email', httpStatus.NOT_FOUND));

        const hashedOldPassword = passwordHelper.passwordToHashWithSalt(req.body.old_password, user.salt);
        if (user.password !== hashedOldPassword) return next(new ApiError('Invalid old password', httpStatus.BAD_REQUEST));

        // Set new Password
        const { hashedPassword, hashedSalt } = passwordHelper.passwordToHash(req.body.new_password);
        const result = await service.updateById(user._id, {
            password: hashedPassword,
            salt: hashedSalt
        });

        if (!result) return next(new ApiError('Password change failed', httpStatus.INTERNAL_SERVER_ERROR));

        eventEmitter.emit('send_email', {
            to: user.email,
            subject: 'Password Changed',
            template: 'passwordChanged',
            context: {
                fullName: user.first_name + ' ' + user.last_name,
            }
        });

        new ApiSuccess('Password has been changed', httpStatus.OK).place(res);
        return next();
    }

    async getEmailVerificationEmail(req, res, next) {
        try {
            const successResult = await userHelper.createAndVerifyEmail(req.body.email);
            successResult.place(res);
            return next();
        } catch (error) {
            return next(error);
        }
    }

    async verifyEmail(req, res, next) {
        try {
            const decodedToken = jwtHelper.decodeEmailVerifyToken(req.body.token);

            const user = await service.fetchOneByQuery({ _id: decodedToken.data._id, email: decodedToken.data.email });
            if (!user) throw new Error();

            const currentVerifyToken = await emailVerificationTokenService.fetchOneByQuery({ user_id: user._id });
            if (!currentVerifyToken) throw new Error();

            if (currentVerifyToken.token !== req.body.token) throw new Error();

            const result = await service.updateById(user._id, {
                email_verified: true
            });

            if (!result) return next(new ApiError('Email verification failed', httpStatus.INTERNAL_SERVER_ERROR));

            await emailVerificationTokenService.deleteById(currentVerifyToken._id);

            eventEmitter.emit('send_email', {
                to: user.email,
                subject: 'Email Verify Successful',
                template: 'emailVerifySuccess',
                context: {
                    fullName: user.first_name + ' ' + user.last_name,
                }
            });

            new ApiSuccess('Email successfully verified', httpStatus.OK).place(res);
            return next();
        } catch (error) {
            return next(new ApiError('Invalid or expired email verification reset token', httpStatus.BAD_REQUEST));
        }
    }
}

module.exports = new UserController();