const express = require('express');
const authorization = require('../../middlewares/authorization');
const router = express.Router();
const controller = require('../../controllers/AddressController');
const authenticate = require('../../middlewares/authenticate');
const paramIdValidator = require('../../middlewares/paramsIdValidator');

router
    .route('/get-all')
    .get(
        authenticate,
        authorization('Admin'),
        controller.fetchAll
    );
router
    .route('/get/:id')
    .get(
        authenticate,
        authorization('Admin'),
        paramIdValidator,
        controller.fetchOneByParamsId
    );

module.exports = router;
