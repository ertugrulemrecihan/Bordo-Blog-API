const express = require('express');
const router = express.Router();
const controller = require('../controllers/PlanController');
const authenticate = require('../middlewares/authenticate');
const paramIdValidator = require('../middlewares/paramsIdValidator');
const cache = require('../middlewares/cache');

router
    .route('/get-all')
    .get(
        authenticate,
        cache(controller),
        controller.fetchAllByQuery
    );
router
    .route('/get/:id')
    .get(
        authenticate,
        paramIdValidator,
        cache(controller),
        controller.fetchOneByParamsId
    );

module.exports = router;
