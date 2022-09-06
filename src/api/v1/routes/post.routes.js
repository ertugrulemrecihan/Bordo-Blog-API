const express = require('express');
const router = express.Router();
const controller = require('../controllers/post.controller');
const authenticate = require('../middlewares/authenticate.middleware');
const bodyValidator = require('../middlewares/body-validator.middleware');
const fileValidator = require('../middlewares/file-validator.middleware');
const queryOptions = require('../middlewares/query-options.middleware');
const schemas = require('../validations/post.validations');
// eslint-disable-next-line max-len
const paramIdValidator = require('../middlewares/params-id-validator.middleware');

router.route('/my').get(authenticate, queryOptions, controller.fetchAllMyPosts);

router
    .route('/my/:id')
    .get(authenticate, paramIdValidator, controller.fetchOneMyPost);

router.route('/previews').get(queryOptions, controller.fetchAllPreviews);

router.route('/').post(
    authenticate,
    bodyValidator(schemas.createValidation),
    fileValidator([
        {
            field: 'cover_image',
            mimetypes: ['image/jpeg', 'image/png'],
            required: true,
            max: 1,
        },
    ]),
    controller.create
);

router
    .route('/:id')
    .delete(authenticate, paramIdValidator, controller.deleteMyPost);

router.route('/:id').patch(
    authenticate,
    paramIdValidator,
    bodyValidator(schemas.updateValidation),
    fileValidator([
        {
            field: 'cover_image',
            mimetypes: ['image/jpeg', 'image/png'],
            required: false,
            max: 1,
        },
    ]),
    controller.updateMyPost
);

// ! FIXME: Abone olmalı
router
    .route('/:id')
    .get(authenticate, paramIdValidator, controller.fetchOtherUsersPost);

// ! FIXME: Abone olmalı
router
    .route('/:id/likes')
    .post(authenticate, paramIdValidator, controller.changeLikeStatus);

// ! FIXME: Abone olmalı
router
    .route('/:id/comments')
    .post(
        authenticate,
        paramIdValidator,
        bodyValidator(schemas.addComment),
        controller.addComment
    );

// ! FIXME: Abone olmalı
router
    .route('/:id/comments')
    .delete(
        authenticate,
        paramIdValidator,
        bodyValidator(schemas.deleteComment),
        controller.deleteComment
    );

module.exports = router;
