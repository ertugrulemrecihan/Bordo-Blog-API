const express = require('express');
const router = express.Router();
const controller = require('../../controllers/RoleController');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorization');
const paramIdValidator = require('../../middlewares/paramsIdValidator');

router
    .route('/get-all')
    .get(
        authenticate,
        authorize('Admin'),
        controller.fetchAllByQuery
    );
router
    .route('/get/:id')
    .get(
        authenticate,
        authorize('Admin'),
        paramIdValidator,
        controller.fetchOneByParamsId
    );

module.exports = router;
