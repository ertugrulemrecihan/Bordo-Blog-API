const express = require('express');
const router = express.Router();
const controller = require('../controllers/PlanController');
const authenticate = require('../middlewares/authenticate');
const paramIdValidator = require('../middlewares/paramsIdValidator');

router
    .route('/get-all')
    .get(
        authenticate,
        controller.fetchAllByQuery
    );
router
    .route('/get/:id')
    .get(
        authenticate,
        paramIdValidator,
        controller.fetchOneByParamsId
    );

module.exports = router;
