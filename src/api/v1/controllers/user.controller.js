/* eslint-disable max-len */
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const service = require('../services/user.service');
const postService = require('../services/post.service');
const statisticHelper = require('../scripts/helpers/statistics.helper');
const passwordHelper = require('../scripts/helpers/password.helper');
const jwtHelper = require('../scripts/helpers/jwt.helper');
const userHelper = require('../scripts/helpers/user.helper');
const googleDriveHelper = require('../scripts/helpers/google-drive.helper');
const paginationHelper = require('../scripts/helpers/pagination.helper');
const ApiDataSuccess = require('../scripts/responses/success/apiDataSuccess');
const ApiError = require('../scripts/responses/error/apiError');
const eventEmitter = require('../scripts/events/event-emitter.event');
const ApiSuccess = require('../scripts/responses/success/apiSuccess');
// eslint-disable-next-line max-len
const passwordResetTokenService = require('../services/password-reset-token.service');
// eslint-disable-next-line max-len
const emailVerificationTokenService = require('../services/email-verification-token.service');
const BaseController = require('./base.controller');
const userService = require('../services/user.service');
const accessTokenService = require('../services/access-token.service');
const refreshTokenService = require('../services/refresh-token.service');
const roleService = require('../services/role.service');
const redisHelper = require('../scripts/helpers/redis.helper');

class UserController extends BaseController {
    constructor() {
        super(userService);
    }

    register = async (req, res, next) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { hashedPassword, hashedSalt } =
                passwordHelper.passwordToHash(req.body.password);

            req.body.password = hashedPassword;
            req.body.salt = hashedSalt;
            req.body.last_login = Date.now();

            const user = (await service.create(req.body, session))[0];
            if (!user) {
                await session.abortTransaction();
                await session.endSession();

                throw new Error();
            }

            const response = userHelper.createResponse(user);

            const accessToken = response.access_token;
            const refreshToken = response.refresh_token;

            const accessTokenResult = (
                await accessTokenService.create(
                    {
                        user: user._id,
                        token: accessToken,
                    },
                    session
                )
            )[0];

            const refreshTokenResult = (
                await refreshTokenService.create(
                    {
                        user: user._id,
                        token: refreshToken,
                    },
                    session
                )
            )[0];

            if (!accessTokenResult || !refreshTokenResult) {
                await session.abortTransaction();
                await session.endSession();

                throw new Error();
            }

            await session.commitTransaction();
            await session.endSession();

            await userHelper.createAndVerifyEmail(req.body.email);

            await redisHelper.removeByClassName(this.constructor.name);

            ApiDataSuccess.send(
                response,
                'Registration successful',
                httpStatus.CREATED,
                res
            );
        } catch (error) {
            await session.abortTransaction();
            await session.endSession();

            if (error.code === 11000) {
                return next(
                    new ApiError('Email already exists', httpStatus.CONFLICT)
                );
            }

            return next(
                new ApiError(
                    'Registration failed',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }
    };

    login = async (req, res, next) => {
        const user = await service.fetchOneByQuery(
            { email: req.body.email },
            {
                select: '+password +salt',
            }
        );

        if (!user) {
            return next(
                new ApiError(
                    'Email or password is incorrect',
                    httpStatus.BAD_REQUEST
                )
            );
        }

        const hashedPassword = passwordHelper.passwordToHashWithSalt(
            req.body.password,
            user.salt
        );

        if (user.password !== hashedPassword) {
            return next(
                new ApiError(
                    'Email or password is incorrect',
                    httpStatus.BAD_REQUEST
                )
            );
        }

        const response = userHelper.createResponse(user);

        const accessToken = response.access_token;
        const refreshToken = response.refresh_token;

        const currentAccessToken = await accessTokenService.fetchOneByQuery({
            user: user._id,
        });

        // ! FIXME - Silmek yerine mevcut olan response edilebilir mi?
        if (currentAccessToken) {
            await accessTokenService.deleteById(currentAccessToken._id);
        }

        const accessTokenResult = await accessTokenService.create({
            user: user._id,
            token: accessToken,
        });

        const currentRefreshToken = await refreshTokenService.fetchOneByQuery({
            user: user._id,
        });

        if (currentRefreshToken) {
            await refreshTokenService.deleteById(currentRefreshToken._id);
        }

        const refreshTokenResult = await refreshTokenService.create({
            user: user._id,
            token: refreshToken,
        });

        if (!accessTokenResult || !refreshTokenResult) {
            return next(
                new ApiError('Login Failed', httpStatus.INTERNAL_SERVER_ERROR)
            );
        }

        await userService.updateById(user._id, { last_login: Date.now() });

        ApiDataSuccess.send(response, 'Login successful', httpStatus.OK, res);
    };

    changeEmailGetEmail = async (req, res, next) => {
        const newEmailAddress = req.body.new_email;

        if (newEmailAddress == req.user.email) {
            return next(
                new ApiError(
                    'Your email address is already registered',
                    httpStatus.BAD_REQUEST
                )
            );
        }

        const currentNewEmailUser = await service.fetchOneByQuery({
            email: newEmailAddress,
        });

        if (currentNewEmailUser) {
            return next(
                new ApiError('Email is already in use', httpStatus.CONFLICT)
            );
        }

        const currentVerifyToken =
            await emailVerificationTokenService.fetchOneByQuery({
                user: req.user._id,
            });

        if (currentVerifyToken) {
            await emailVerificationTokenService.deleteById(
                currentVerifyToken._id
            );
        }

        const jwtUser = userHelper.deleteProfile(req.user);
        const jwtObject = {
            ...jwtUser,
            newEmailAddress,
        };
        const changeEmailToken = jwtHelper.generateEmailVerifyToken(jwtObject);

        await emailVerificationTokenService.create({
            user_id: req.user._id,
            token: changeEmailToken,
        });

        const verifyUrl =
            process.env.NODE_ENV == 'PRODUCTION'
                ? `${process.env.API_URL}/api/v1/users/change-email/${changeEmailToken}`
                : `${process.env.API_URL}:${process.env.PORT}/api/v1/users/change-email/${changeEmailToken}`;

        eventEmitter.emit('send_email', {
            to: newEmailAddress,
            subject: 'Change Email Address',
            template: 'change-email.template',
            context: {
                fullName: req.user.first_name + ' ' + req.user.last_name,
                validationUrl: verifyUrl,
                expires: process.env.JWT_EMAIL_VERIFY_EXP,
            },
        });

        ApiSuccess.send(
            'Email change link sent successfully.',
            httpStatus.OK,
            res
        );
    };

    changeEmail = async (req, res, next) => {
        const changeEmailToken = req.params.changeEmailToken;

        try {
            const decodedToken =
                jwtHelper.decodeEmailVerifyToken(changeEmailToken);

            const user = await service.fetchOneByQuery({
                _id: decodedToken.data._id,
                email: decodedToken.data.email,
            });

            if (!user) {
                throw new Error();
            }

            const currentChangeEmailToken =
                await emailVerificationTokenService.fetchOneByQuery({
                    user_id: user._id,
                });

            if (!currentChangeEmailToken) {
                throw new Error();
            }

            if (currentChangeEmailToken.token !== changeEmailToken) {
                throw new Error();
            }

            const result = await service.updateById(user._id, {
                email: decodedToken.data.newEmailAddress,
            });

            if (!result) {
                return next(
                    new ApiError(
                        'Could not change email',
                        httpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }

            await emailVerificationTokenService.deleteById(
                currentChangeEmailToken._id
            );

            eventEmitter.emit('send_email', {
                to: user.email,
                subject: 'Email Change Successful',
                template: 'change-email-success.template',
                context: {
                    fullName: user.first_name + ' ' + user.last_name,
                },
            });

            ApiSuccess.send('Email successfully changed', httpStatus.OK, res);
        } catch (error) {
            if (error.code === 11000) {
                return next(
                    new ApiError('Email is already in use', httpStatus.CONFLICT)
                );
            }

            return next(
                new ApiError(
                    'Invalid or expired change email token',
                    httpStatus.BAD_REQUEST
                )
            );
        }
    };

    logOut = async (req, res, next) => {
        const result = await userHelper.logOut(req.user._id);

        if (result) {
            return next(
                new ApiError('Log out failed', httpStatus.INTERNAL_SERVER_ERROR)
            );
        }

        ApiSuccess.send('Log out successfully', httpStatus.OK, res);
    };

    getPasswordResetEmail = async (req, res, next) => {
        const user = await service.fetchOneByQuery({ email: req.body.email });
        if (!user) {
            return next(
                new ApiError(
                    'No user found associated with this email',
                    httpStatus.NOT_FOUND
                )
            );
        }

        const currentResetToken =
            await passwordResetTokenService.fetchOneByQuery({
                user_id: user._id,
            });

        if (currentResetToken) {
            await passwordResetTokenService.deleteById(currentResetToken._id);
        }

        const jwtUser = userHelper.deletePasswordAndSaltFields(user);
        const resetToken = jwtHelper.generatePasswordResetToken(jwtUser);

        await passwordResetTokenService.create({
            user_id: user._id,
            token: resetToken,
        });

        // ! FIXME - Add frontend password reset page url
        const resetUrl = resetToken;

        eventEmitter.emit('send_email', {
            to: user.email,
            subject: 'Password Reset',
            template: 'password-reset.template',
            context: {
                fullName: user.first_name + ' ' + user.last_name,
                resetUrl,
                expires: process.env.JWT_PASSWORD_RESET_EXP,
            },
        });

        ApiSuccess.send(
            'Your password reset link has been sent as email',
            httpStatus.OK,
            res
        );
    };

    resetPassword = async (req, res, next) => {
        try {
            const decodedToken = jwtHelper.decodePasswordResetToken(
                req.body.token
            );

            const user = await service.fetchOneByQuery({
                _id: decodedToken.data._id,
                email: decodedToken.data.email,
            });

            if (!user) {
                throw new Error();
            }

            const currentResetToken =
                await passwordResetTokenService.fetchOneByQuery({
                    user_id: user._id,
                });

            if (!currentResetToken) {
                throw new Error();
            }

            if (currentResetToken.token !== req.body.token) {
                throw new Error();
            }

            const { hashedPassword, hashedSalt } =
                passwordHelper.passwordToHash(req.body.new_password);

            const result = await service.updateById(user._id, {
                password: hashedPassword,
                salt: hashedSalt,
            });

            if (!result) {
                return next(
                    new ApiError(
                        'Password reset failed',
                        httpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }

            await passwordResetTokenService.deleteById(currentResetToken._id);

            eventEmitter.emit('send_email', {
                to: user.email,
                subject: 'Password Reset Successful',
                template: 'password-reset-success.template',
                context: {
                    fullName: user.first_name + ' ' + user.last_name,
                },
            });

            await userHelper.logOut(user._id);

            ApiSuccess.send('Password has been reset', httpStatus.OK, res);
        } catch {
            return next(
                new ApiError(
                    'Invalid or expired password reset token',
                    httpStatus.BAD_REQUEST
                )
            );
        }
    };

    changePassword = async (req, res, next) => {
        // Validate old password
        const user = await service.fetchOneByQuery({ email: req.user.email });
        if (!user) {
            return next(
                new ApiError(
                    'No user found associated with this email',
                    httpStatus.NOT_FOUND
                )
            );
        }

        const hashedOldPassword = passwordHelper.passwordToHashWithSalt(
            req.body.old_password,
            user.salt
        );

        if (user.password !== hashedOldPassword) {
            return next(
                new ApiError('Invalid old password', httpStatus.BAD_REQUEST)
            );
        }

        // Set new Password
        const { hashedPassword, hashedSalt } = passwordHelper.passwordToHash(
            req.body.new_password
        );

        const result = await service.updateById(user._id, {
            password: hashedPassword,
            salt: hashedSalt,
        });

        if (!result) {
            return next(
                new ApiError(
                    'Password change failed',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        eventEmitter.emit('send_email', {
            to: user.email,
            subject: 'Password Changed',
            template: 'password-changed.template',
            context: {
                fullName: user.first_name + ' ' + user.last_name,
            },
        });

        await userHelper.logOut(req.user._id);

        ApiSuccess.send('Password has been changed', httpStatus.OK, res);
    };

    getEmailVerificationEmail = async (req, res, next) => {
        try {
            const successResult = await userHelper.createAndVerifyEmail(
                req.body.email
            );

            ApiSuccess.send(
                successResult.message,
                successResult.statusCode,
                res
            );
        } catch (error) {
            return next(error);
        }
    };

    verifyEmail = async (req, res, next) => {
        try {
            const emailVerifyToken = req.params.emailVerifyToken;

            const decodedToken =
                jwtHelper.decodeEmailVerifyToken(emailVerifyToken);

            const user = await service.fetchOneByQuery({
                _id: decodedToken.data._id,
                email: decodedToken.data.email,
            });

            if (!user) {
                throw new Error();
            }

            if (user.email_verified) {
                return next(
                    new ApiError(
                        'User email already verified',
                        httpStatus.BAD_REQUEST
                    )
                );
            }

            const currentVerifyToken =
                await emailVerificationTokenService.fetchOneByQuery({
                    user_id: user._id,
                });

            if (!currentVerifyToken) {
                throw new Error();
            }

            if (currentVerifyToken.token !== emailVerifyToken) {
                throw new Error();
            }

            const result = await service.updateById(user._id, {
                email_verified: true,
            });

            if (!result) {
                return next(
                    new ApiError(
                        'Email verification failed',
                        httpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }

            await emailVerificationTokenService.deleteById(
                currentVerifyToken._id
            );

            eventEmitter.emit('send_email', {
                to: user.email,
                subject: 'Email Verify Successful',
                template: 'verify-email-success.template',
                context: {
                    fullName: user.first_name + ' ' + user.last_name,
                },
            });

            // ! FIXME - Kullanıcıyı frontend ana sayfaya yönlendir

            ApiSuccess.send('Email successfully verified', httpStatus.OK, res);
        } catch (error) {
            return next(
                new ApiError(
                    'Invalid or expired email verification token',
                    httpStatus.BAD_REQUEST
                )
            );
        }
    };

    getMyProfile = async (req, res) => {
        ApiDataSuccess.send(
            req.user,
            'Profile fetched successfully',
            httpStatus.OK,
            res
        );
    };

    fetchAllForAdmin = async (req, res, next) => {
        const posts = await postService.fetchAll();

        const users = await userService.fetchAll({
            queryOptions: req?.queryOptions,
        });

        const response = [];

        for (const user of users) {
            const userPosts = posts.filter(
                (post) => post.writer._id.toString() == user._id.toString()
            );

            const postStatistics = statisticHelper.postStatistics(userPosts);

            response.push({
                user,
                statistics: postStatistics,
            });
        }

        if (response.length > 0) {
            await redisHelper.cache(req, response);
        }

        if (req?.queryOptions?.pagination?.limit) {
            const totalItemCount = await userService.count();

            const paginationInfo = paginationHelper.getPaginationInfo(
                totalItemCount,
                req.queryOptions.pagination?.limit,
                req.queryOptions.pagination?.page
            );

            if (paginationInfo.error) {
                return next(
                    new ApiError(
                        paginationInfo.error.message,
                        paginationInfo.error.code
                    )
                );
            }

            response.push(paginationInfo.data);
        }

        ApiDataSuccess.send(
            response,
            'Users fetched successfully',
            httpStatus.OK,
            res
        );
    };

    fetchOneByParamsIdForAdmin = async (req, res, next) => {
        const user = await service.fetchOneById(req.params.id);

        if (!user) {
            return next(new ApiError('User not found', httpStatus.NOT_FOUND));
        }

        const userPosts = await postService.fetchAll({
            query: { writer: user._id },
        });

        const postStatistics = statisticHelper.postStatistics(userPosts);

        const response = {
            user,
            statistics: postStatistics,
        };

        await redisHelper.cache(req, response);

        ApiDataSuccess.send(
            response,
            'User fetched successfully',
            httpStatus.OK,
            res
        );
    };

    deleteByParamsIdForAdmin = async (req, res, next) => {
        const response = await service.deleteById(req.params.id);

        if (!response) {
            return next(new ApiError('User not found', httpStatus.NOT_FOUND));
        }

        const result = userHelper.deletePasswordAndSaltFields(response);

        await redisHelper.removeByClassName(this.constructor.name);

        ApiDataSuccess.send(
            result,
            'User deleted successfully',
            httpStatus.OK,
            res
        );
    };

    uploadAvatar = async (req, res, next) => {
        try {
            const avatar = req.files.avatar;
            const user = req.user;

            if (user.avatar.url) {
                await googleDriveHelper.deleteFile(user.avatar.file_id);
            }

            const uploadResponse = await googleDriveHelper.uploadFile(
                avatar,
                process.env.GOOGLE_AVATARS_FOLDER
            );

            const updatedUser = await userService.updateById(req.user._id, {
                avatar: {
                    url: uploadResponse.imageUrl,
                    file_id: uploadResponse.id,
                    name: uploadResponse.name,
                },
            });

            if (!updatedUser) {
                throw new Error();
            }

            const newUpdatedUser =
                userHelper.deletePasswordAndSaltFields(updatedUser);

            await redisHelper.removeByClassName(this.constructor.name);

            ApiDataSuccess.send(
                newUpdatedUser,
                'User avatar updated successfully.',
                httpStatus.OK,
                res
            );
        } catch (error) {
            return next(
                new ApiError(
                    'There was a problem uploading the avatar image.',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }
    };

    assignAdminRole = async (req, res, next) => {
        const userId = req.params.userId;

        const adminRole = await roleService.fetchOneByQuery({ name: 'Admin' });

        if (!adminRole) {
            return next(
                new ApiError(
                    'Something went wrong while being assigned the admin role',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        const user = await userService.fetchOneById(userId);

        if (!user) {
            return next(new ApiError('User not found', httpStatus.NOT_FOUND));
        }

        if (
            user.roles.some((r) => r._id.toString() == adminRole._id.toString())
        ) {
            return next(
                new ApiError('User is already admin', httpStatus.CONFLICT)
            );
        }

        const result = await userService.updateById(user._id, {
            $push: { roles: adminRole },
        });

        if (!result) {
            return next(
                new ApiError(
                    'Something went wrong while being assign the admin role',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        await redisHelper.removeByClassName(this.constructor.name);

        ApiSuccess.send('Role assignment successful', httpStatus.OK, res);
    };

    unassignAdminRole = async (req, res, next) => {
        const userId = req.params.userId;

        const adminRole = await roleService.fetchOneByQuery({ name: 'Admin' });

        if (!adminRole) {
            return next(
                new ApiError(
                    'Something went wrong while being unassign the admin role',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        const user = await userService.fetchOneById(userId);

        if (!user) {
            return next(new ApiError('User not found', httpStatus.NOT_FOUND));
        }

        if (
            !user.roles.some(
                (r) => r._id.toString() == adminRole._id.toString()
            )
        ) {
            return next(
                new ApiError(
                    'User is not already admin',
                    httpStatus.BAD_REQUEST
                )
            );
        }

        const result = await userService.updateById(user._id, {
            $pull: { roles: adminRole._id },
        });

        if (!result) {
            return next(
                new ApiError(
                    'Something went wrong while being unassign the admin role',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        await redisHelper.removeByClassName(this.constructor.name);

        ApiSuccess.send(
            'Role assignment successfully removed',
            httpStatus.OK,
            res
        );
    };
}

module.exports = new UserController();
