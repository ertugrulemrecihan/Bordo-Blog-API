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
    .route('/get-all')
    .get(
        authenticate,
        authorization('Admin'),
        queryOptions,
        cache(controller),
        controller.fetchAllForAdmin
    );

router
    .route('/get/:id')
    .get(
        authenticate,
        authorization('Admin'),
        paramsIdValidator,
        cache(controller),
        controller.fetchOneByParamsIdForAdmin
    );

router
    .route('/delete/:id')
    .delete(
        authenticate,
        authorization('Admin'),
        paramsIdValidator,
        controller.deleteByParamsIdForAdmin
    );

router
    .route('/assign-admin/:userId')
    .post(
        authenticate,
        authorization('Admin'),
        paramsIdValidator,
        controller.assignAdminRole
    );

router
    .route('/unassign-admin/:userId')
    .post(
        authenticate,
        authorization('SUPERADMIN'),
        paramsIdValidator,
        controller.unassignAdminRole
    );

module.exports = router;
