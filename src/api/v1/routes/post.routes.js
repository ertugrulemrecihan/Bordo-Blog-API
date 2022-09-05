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

// TODO: Kullanıcının aboneliği varsa getir
router
    .route('/get-all/my')
    .get(authenticate, queryOptions, controller.fetchAllMyPosts); // ! FIXME: Abone olmalı

router
    .route('/get/my/:id')
    .get(authenticate, paramIdValidator, controller.fetchOneMyPost); // ! FIXME: Abone olmalı

router.route('/get-all/previews').get(controller.fetchAllPreviews);

router.route('/create').post(
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
    .route('/delete/my/:id')
    .delete(authenticate, paramIdValidator, controller.deleteMyPost);

router.route('/update/my/:id').patch(
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

router
    .route('/add-view/:id')
    .post(authenticate, paramIdValidator, controller.addView); // ! FIXME: Abone olmalı

router
    .route('/change-like-status/:id')
    .post(authenticate, paramIdValidator, controller.changeLikeStatus); // ! FIXME: Abone olmalı

router
    .route('/add-comment/:id')
    .post(
        authenticate,
        paramIdValidator,
        bodyValidator(schemas.addComment),
        controller.addComment
    );

router
    .route('/delete-comment/:id')
    .delete(
        authenticate,
        paramIdValidator,
        bodyValidator(schemas.deleteComment),
        controller.deleteComment
    );
// TODO: Comment silme ekle

module.exports = router;
