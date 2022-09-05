const express = require('express');
const router = express.Router();
const controller = require('../../controllers/post.controller');
const authenticate = require('../../middlewares/authenticate.middleware');
const authorization = require('../../middlewares/authorization.middleware');
const queryOptions = require('../../middlewares/query-options.middleware');
// eslint-disable-next-line max-len
const paramIdValidator = require('../../middlewares/params-id-validator.middleware');

router
    .route('/')
    .get(
        authenticate,
        authorization('Admin'),
        queryOptions,
        controller.fetchAllForAdmin
    );

router
    .route('/:id')
    .get(
        authenticate,
        authorization('Admin'),
        paramIdValidator,
        controller.fetchOneByParamsId
    );

router
    .route('/:id')
    .delete(
        authenticate,
        authorization('Admin'),
        paramIdValidator,
        controller.deleteByParamsId
    );
// TODO: Comment Silme

module.exports = router;
