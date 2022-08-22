/* eslint-disable max-len */
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const httpStatus = require('http-status');
const service = require('../services/UserService');
const passwordHelper = require('../scripts/utils/password');
const jwtHelper = require('../scripts/utils/jwt');
const userHelper = require('../scripts/utils/user');
const paginationHelper = require('../scripts/utils/pagination');
const ApiDataSuccess = require('../responses/success/apiDataSuccess');
const ApiError = require('../responses/error/apiError');
const eventEmitter = require('../scripts/events/eventEmitter');
const ApiSuccess = require('../responses/success/apiSuccess');
// eslint-disable-next-line max-len
const passwordResetTokenService = require('../services/PasswordResetTokenService');
// eslint-disable-next-line max-len
const emailVerificationTokenService = require('../services/EmailVerificationTokenService');
const BaseController = require('./BaseController');
const userService = require('../services/UserService');
const accessTokenService = require('../services/AccessTokenService');
const refreshTokenService = require('../services/RefreshTokenService');
const roleService = require('../services/RoleService');

class UserController extends BaseController {
    constructor() {
        super(userService);
    }

    async register(req, res, next) {
        const { hashedPassword, hashedSalt } = passwordHelper.passwordToHash(
            req.body.password
        );

        req.body.password = hashedPassword;
        req.body.salt = hashedSalt;
        req.body.last_login = Date.now();

        try {
            const user = await service.create(req.body);
            if (!user) {
                throw new Error();
            }

            // ! FIXME - Populate ile field sil
            const response = userHelper.createResponse(user);

            const accessToken = response.access_token;
            const refreshToken = response.refresh_token;

            const accessTokenResult = await accessTokenService.create({
                user: user._id,
                token: accessToken,
            });

            const refreshTokenResult = await refreshTokenService.create({
                user: user._id,
                token: refreshToken,
            });

            if (!accessTokenResult || !refreshTokenResult) {
                // ! FIXME - Add transaction
                // ! Kullanıcıyı silmek yerine transaction'ı rollback yaptır

                await userService.deleteById(user._id);
                throw new Error();
            }

            try {
                await userHelper.createAndVerifyEmail(req.body.email);
            } catch (error) {
                ApiDataSuccess.send(
                    response,
                    'Your registration has been created successfully, but the verification link could not be sent',
                    httpStatus.CREATED,
                    res,
                    next
                );
            }

            ApiDataSuccess.send(
                response,
                'Registration successful',
                httpStatus.CREATED,
                res,
                next
            );
        } catch (error) {
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
    }

    async login(req, res, next) {
        const user = await service.fetchOneByQuery({ email: req.body.email });

        if (!user) {
            return next(
                new ApiError(
                    'No user found associated with this email',
                    httpStatus.NOT_FOUND
                )
            );
        }

        const hashedPassword = passwordHelper.passwordToHashWithSalt(
            req.body.password,
            user.salt
        );

        if (user.password !== hashedPassword) {
            return next(
                new ApiError('Invalid password', httpStatus.BAD_REQUEST)
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

        ApiDataSuccess.send(
            response,
            'Login successful',
            httpStatus.OK,
            res,
            next
        );
    }

    async logOut(req, res, next) {
        const result = await userHelper.logOut(req.user._id);

        if (result) {
            return next(
                new ApiError('Log out failed', httpStatus.INTERNAL_SERVER_ERROR)
            );
        }

        ApiSuccess.send('Log out successfully', httpStatus.OK, res, next);
    }

    async getPasswordResetEmail(req, res, next) {
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
            template: 'passwordReset',
            context: {
                fullName: user.first_name + ' ' + user.last_name,
                resetUrl,
                expires: process.env.JWT_PASSWORD_RESET_EXP,
            },
        });

        ApiSuccess.send(
            'Your password reset link has been sent as email',
            httpStatus.OK,
            res,
            next
        );
    }

    async resetPassword(req, res, next) {
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
                template: 'passwordResetSuccess',
                context: {
                    fullName: user.first_name + ' ' + user.last_name,
                },
            });

            await userHelper.logOut(user._id);

            ApiSuccess.send(
                'Password has been reset',
                httpStatus.OK,
                res,
                next
            );
        } catch {
            return next(
                new ApiError(
                    'Invalid or expired password reset token',
                    httpStatus.BAD_REQUEST
                )
            );
        }
    }

    async changePassword(req, res, next) {
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
            template: 'passwordChanged',
            context: {
                fullName: user.first_name + ' ' + user.last_name,
            },
        });

        await userHelper.logOut(req.user._id);

        ApiSuccess.send('Password has been changed', httpStatus.OK, res, next);
    }

    async getEmailVerificationEmail(req, res, next) {
        try {
            const successResult = await userHelper.createAndVerifyEmail(
                req.body.email
            );
            ApiSuccess.send(
                successResult.message,
                successResult.statusCode,
                res,
                next
            );
        } catch (error) {
            return next(error);
        }
    }

    async verifyEmail(req, res, next) {
        const emailVerifyToken = req.params.emailVerifyToken;
        try {
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
                template: 'emailVerifySuccess',
                context: {
                    fullName: user.first_name + ' ' + user.last_name,
                },
            });

            // ! FIXME - Kullanıcıyı frontend ana sayfaya yönlendir

            ApiSuccess.send(
                'Email successfully verified',
                httpStatus.OK,
                res,
                next
            );
        } catch (error) {
            return next(
                new ApiError(
                    'Invalid or expired email verification token',
                    httpStatus.BAD_REQUEST
                )
            );
        }
    }

    async getMyProfile(req, res, next) {
        ApiDataSuccess.send(
            req.user,
            'Profile fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async fetchAllForAdmin(req, res, next) {
        const response = await service.fetchAll();

        // ! FIXME - BaseService'e metod bazlı popülasyon
        // ! eklendiğinde burayı güncelle
        const result = response.map((u) =>
            userHelper.deletePasswordAndSaltFields(u)
        );

        ApiDataSuccess.send(
            result,
            'Users fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async fetchOneByParamsIdForAdmin(req, res, next) {
        const response = await service.fetchOneById(req.params.id);

        if (!response) {
            return next(new ApiError('User not found', httpStatus.NOT_FOUND));
        }

        // ! FIXME - BaseService'e metod bazlı popülasyon
        // ! eklendiğinde burayı güncelle
        const result = userHelper.deletePasswordAndSaltFields(response);

        ApiDataSuccess.send(
            result,
            'User fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async deleteByParamsIdForAdmin(req, res, next) {
        const response = await service.deleteById(req.params.id);

        if (!response) {
            return next(new ApiError('User not found', httpStatus.NOT_FOUND));
        }

        // ! FIXME - BaseService'e metod bazlı popülasyon
        // ! eklendiğinde burayı güncelle
        const result = userHelper.deletePasswordAndSaltFields(response);

        ApiDataSuccess.send(
            result,
            'User deleted successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async uploadAvatar(req, res, next) {
        try {
            const avatar = req.files.avatar;

            const newFileName = `${uuidv4()}.${mime.extension(
                avatar.mimetype
            )}`;

            const uploadPath = path.join(
                __dirname,
                '../../../../public/uploads/avatars/',
                newFileName
            );

            avatar.mv(uploadPath, function (err) {
                if (err) {
                    return next(
                        new ApiError(
                            'An error was encountered while uploading the file',
                            httpStatus.INTERNAL_SERVER_ERROR
                        )
                    );
                }
            });

            if (req.user.avatar != '/uploads/avatars/default-avatar.jpg') {
                const currentPath = path.join(
                    __dirname,
                    '../../../../public',
                    req.user.avatar
                );
                if (fs.existsSync(currentPath)) {
                    fs.unlinkSync(currentPath);
                }
            }

            const updatedUser = await userService.updateById(req.user._id, {
                avatar: '/uploads/avatars/' + newFileName,
            });

            const newUpdatedUser =
                userHelper.deletePasswordAndSaltFields(updatedUser);

            if (!newUpdatedUser) {
                if (fs.existsSync(uploadPath)) {
                    fs.unlinkSync(uploadPath);
                }
                return next(
                    new ApiError(
                        'An error was encountered while uploading the file',
                        httpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }

            ApiDataSuccess.send(
                newUpdatedUser,
                'User avatar updated successfully.',
                httpStatus.OK,
                res,
                next
            );
        } catch (error) {
            return new ApiError(error, httpStatus.BAD_REQUEST);
        }
    }

    async assignAdminRole(req, res, next) {
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

        ApiSuccess.send('Role assignment successful', httpStatus.OK, res, next);
    }

    async unassignAdminRole(req, res, next) {
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

        ApiSuccess.send(
            'Role assignment successfully removed',
            httpStatus.OK,
            res,
            next
        );
    }

    async fetchAllUserSortByQuery(req, res, next) {
        const fieldName = req.query.fieldName;

        const fields = Object.keys(userService.model.schema.paths);

        const isExistField = paginationHelper.isValidSortField(
            fieldName,
            fields
        );

        if (!isExistField) {
            return next(
                new ApiError(
                    'The field specified in the query was not found',
                    httpStatus.NOT_FOUND
                )
            );
        }

        const users = await userService.fetchAll(
            {},
            fieldName,
            null,
            null,
            null,
            '-password -salt'
        );

        ApiDataSuccess.send(
            users,
            'Users fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async fetchUsersByLimit(req, res, next) {
        const fieldName = req.query?.fieldName;

        if (fieldName) {
            const fields = Object.keys(userService.model.schema.paths);

            const isExistField = paginationHelper.isValidSortField(
                fieldName,
                fields
            );

            if (!isExistField) {
                return next(
                    new ApiError(
                        'The field specified in the query was not found',
                        httpStatus.NOT_FOUND
                    )
                );
            }
        }

        const pageMaxItem = req.query.limit == null ? 10 : req.query.limit;
        const pageNumber = req.query.page == null ? 1 : req.query.page;
        const startPage = (pageNumber - 1) * pageMaxItem;

        const users = await userService.fetchAll(
            {},
            fieldName,
            pageMaxItem,
            startPage
        );

        ApiDataSuccess.send(
            users,
            'Users fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }
}

module.exports = new UserController();
