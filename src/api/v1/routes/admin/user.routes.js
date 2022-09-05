const express = require('express');
const router = express.Router();
const controller = require('../../controllers/user.controller');
const authenticate = require('../../middlewares/authenticate.middleware');
const authorization = require('../../middlewares/authorization.middleware');
const queryOptions = require('../../middlewares/query-options.middleware');
const cache = require('../../middlewares/cache.middleware');
// eslint-disable-next-line max-len
const paramsIdValidator = require('../../middlewares/params-id-validator.middleware');

router
    .route('/')
    .get(
        authenticate,
        authorization('Admin'),
        queryOptions,
        cache(controller),
        controller.fetchAllForAdmin
    );

router
    .route('/:id')
    .get(
        authenticate,
        authorization('Admin'),
        paramsIdValidator,
        cache(controller),
        controller.fetchOneByParamsIdForAdmin
    );

router
    .route('/:id')
    .delete(
        authenticate,
        authorization('Admin'),
        paramsIdValidator,
        controller.deleteByParamsIdForAdmin
    );

router
    .route('/assign/:userId')
    .post(
        authenticate,
        authorization('Admin'),
        paramsIdValidator,
        controller.assignAdminRole
    );

router
    .route('/assign/:userId')
    .delete(
        authenticate,
        authorization('SUPERADMIN'),
        paramsIdValidator,
        controller.unassignAdminRole
    );

module.exports = router;
