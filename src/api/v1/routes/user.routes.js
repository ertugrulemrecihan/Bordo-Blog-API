const express = require('express');
const router = express.Router();
const schemas = require('../validations/user.validations');
const controller = require('../controllers/user.controller');
const bodyValidator = require('../middlewares/body-validator.middleware');
const authenticate = require('../middlewares/authenticate.middleware');
const fileValidator = require('../middlewares/file-validator.middleware');

router
    .route('/login')
    .post(bodyValidator(schemas.loginValidation), controller.login);

router
    .route('/register')
    .post(bodyValidator(schemas.registerValidation), controller.register);

router.route('/logout').post(authenticate, controller.logOut);

router.route('/upload-avatar').patch(
    authenticate,
    fileValidator([
        {
            field: 'avatar',
            mimetypes: ['image/jpeg', 'image/png'],
            max: 1,
        },
    ]),
    controller.uploadAvatar
);

router
    .route('/emails/email-change')
    .patch(
        authenticate,
        bodyValidator(schemas.createChangeEmailTokenValidation),
        controller.changeEmailGetEmail
    );

router
    .route('/emails/password-reset')
    .post(
        bodyValidator(schemas.createPasswordResetTokenValidation),
        controller.getPasswordResetEmail
    );

router
    .route('/emails/email-verification')
    .post(
        bodyValidator(schemas.createEmailVerificationTokenValidation),
        controller.getEmailVerificationEmail
    );

router
    .route('/password-reset')
    .post(
        bodyValidator(schemas.resetPasswordValidation),
        controller.resetPassword
    );

router
    .route('/password-change')
    .post(
        authenticate,
        bodyValidator(schemas.changePasswordValidation),
        controller.changePassword
    );

router
    .route('/redirects/verify-email/:emailVerifyToken')
    .get(controller.verifyEmail);

router
    .route('/redirects/change-email/:changeEmailToken')
    .get(controller.changeEmail);

router.route('/profile').get(authenticate, controller.getMyProfile);

module.exports = router;
