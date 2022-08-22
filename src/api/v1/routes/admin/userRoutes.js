const express = require('express');
const router = express.Router();
const controller = require('../../controllers/UserController');
const authenticate = require('../../middlewares/authenticate');
const authorization = require('../../middlewares/authorization');
const paramsIdValidator = require('../../middlewares/paramsIdValidator');

router
    .route('/get-all')
    .get(
        authenticate,
        authorization('Admin'),
        controller.fetchAllForAdmin
    );
router
    .route('/get-all/sort')
    .get(
        authenticate,
        authorization('Admin'),
        paramsIdValidator,
        controller.fetchAllUserSortByQuery
    );
router
    .route('/get-by-limit')
    .get(
        authenticate,
        authorization('Admin'),
        paramsIdValidator,
        controller.fetchUsersByLimit
    );    
router
    .route('/get/:id')
    .get(
        authenticate,
        authorization('Admin'),
        paramsIdValidator,
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
