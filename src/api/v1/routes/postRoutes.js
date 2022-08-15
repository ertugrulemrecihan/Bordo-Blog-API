const express = require('express');
const router = express.Router();
const controller = require('../controllers/PostController');
const authenticate = require('../middlewares/authenticate');
const bodyValidator = require('../middlewares/bodyValidator');
const paramIdValidator = require('../middlewares/paramsIdValidator');
const schemas = require('../validations/post');

// TODO: Kullanıcının aboneliği varsa getir
router
    .route('/getAll/my')
    .get(authenticate, controller.fetchAllMyPosts); // ! FIXME: Abone olmalı
router
    .route('/get/my/:id')
    .get(
        authenticate,
        paramIdValidator,
        controller.fetchOneMyPost
    ); // ! FIXME: Abone olmalı
router
    .route('/getAll/previews')
    .get(controller.fetchAllPreviews);
router
    .route('/get/preview/:id')
    .get(paramIdValidator, controller.fetchOnePreview);
router
    .route('/create')
    .post(
        authenticate,
        bodyValidator(schemas.createValidation),
        controller.create
    );
router
    .route('/delete/my/:id')
    .delete(
        authenticate,
        paramIdValidator,
        controller.deleteMyPost
    );
router
    .route('/update/my/:id')
    .patch(
        authenticate,
        paramIdValidator,
        bodyValidator(schemas.updateValidation),
        controller.updateMyPost
    );
router
    .route('/addView/:id')
    .post(
        authenticate,
        paramIdValidator,
        controller.addView
    ); // ! FIXME: Abone olmalı
router
    .route('/changeLikeStatus/:id')
    .post(
        authenticate,
        paramIdValidator,
        controller.changeLikeStatus
    ); // ! FIXME: Abone olmalı
router
    .route('/addComment/:id')
    .post(
        authenticate,
        paramIdValidator,
        bodyValidator(schemas.addComment),
        controller.addComment
    );
router
    .route('/deleteComment/:id')
    .post(
        authenticate,
        paramIdValidator,
        bodyValidator(schemas.deleteComment),
        controller.deleteComment
    );
// TODO: Comment silme ekle
router
    .route('/addTag/:id')
    .post(
        authenticate,
        paramIdValidator,
        bodyValidator(schemas.addTag),
        controller.addTag
    );
router
    .route('/removeTag/:id')
    .post(
        authenticate,
        paramIdValidator,
        bodyValidator(schemas.removeTag),
        controller.removeTag
    );

module.exports = router;
