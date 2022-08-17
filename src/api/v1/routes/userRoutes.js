const express = require('express');
const router = express.Router();
const schemas = require('../validations/user');
const controller = require('../controllers/UserController');
const bodyValidator = require('../middlewares/bodyValidator');
const authenticate = require('../middlewares/authenticate');
const fileValidator = require('../middlewares/fileValidator');

router
    .route('/login')
    .post(
        bodyValidator(schemas.loginValidation),
        controller.login
    );
router
    .route('/register')
    .post(
        bodyValidator(schemas.registerValidation),
        controller.register
    );
router
    .route('/logout')
    .post(authenticate, controller.logOut);
router
    .route('/upload-avatar')
    .post(
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
    .route('/get-password-reset-email')
    .post(
        bodyValidator(
            schemas.createPasswordResetTokenValidation
        ),
        controller.getPasswordResetEmail
    );
router
    .route('/get-email-verification-email')
    .post(
        bodyValidator(
            schemas.createEmailVerificationTokenValidation
        ),
        controller.getEmailVerificationEmail
    );
router
    .route('/reset-password')
    .post(
        bodyValidator(schemas.resetPasswordValidation),
        controller.resetPassword
    );
router
    .route('/change-password')
    .post(
        authenticate,
        bodyValidator(schemas.changePasswordValidation),
        controller.changePassword
    );
router
    .route('/verify-email/:emailVerifyToken')
    .get(controller.verifyEmail);
router
    .route('/profile')
    .get(authenticate, controller.getMyProfile);

module.exports = router;
