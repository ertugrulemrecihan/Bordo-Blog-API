const express = require('express');
const router = express.Router();
const controller = require('../controllers/PostController');
const authenticate = require('../middlewares/authenticate');
const bodyValidator = require('../middlewares/bodyValidator');
const paramIdValidator = require('../middlewares/paramsIdValidator');
const schemas = require('../validations/post');

// TODO: Kullanıcının aboneliği varsa getir
router
    .route('/get-all/my')
    .get(authenticate, controller.fetchAllMyPosts); // ! FIXME: Abone olmalı
router
    .route('/get/my/:id')
    .get(
        authenticate,
        paramIdValidator,
        controller.fetchOneMyPost
    ); // ! FIXME: Abone olmalı
router
    .route('/get-all/previews')
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
    .route('/add-view/:id')
    .post(
        authenticate,
        paramIdValidator,
        controller.addView
    ); // ! FIXME: Abone olmalı
router
    .route('/change-like-status/:id')
    .post(
        authenticate,
        paramIdValidator,
        controller.changeLikeStatus
    ); // ! FIXME: Abone olmalı
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
router
    .route('/add-tag/:id')
    .post(
        authenticate,
        paramIdValidator,
        bodyValidator(schemas.addTag),
        controller.addTag
    );
router
    .route('/delete-tag/:id')
    .delete(
        authenticate,
        paramIdValidator,
        bodyValidator(schemas.removeTag),
        controller.removeTag
    );

module.exports = router;
