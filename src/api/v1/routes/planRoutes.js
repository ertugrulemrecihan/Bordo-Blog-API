const express = require('express');
const router = express.Router();
const controller = require('../controllers/PlanController');
const paramIdValidator = require('../middlewares/paramsIdValidator');
const cache = require('../middlewares/cache');

router.route('/get-all').get(cache(controller), controller.fetchAllByQuery);
router
    .route('/get/:id')
    .get(paramIdValidator, cache(controller), controller.fetchOneByParamsId);

module.exports = router;
