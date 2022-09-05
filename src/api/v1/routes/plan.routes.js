const express = require('express');
const router = express.Router();
const controller = require('../controllers/plan.controller');
const cache = require('../middlewares/cache.middleware');
// eslint-disable-next-line max-len
const paramIdValidator = require('../middlewares/params-id-validator.middleware');

router.route('/').get(cache(controller), controller.fetchAllByQuery);

router
    .route('/:id')
    .get(paramIdValidator, cache(controller), controller.fetchOneByParamsId);

module.exports = router;
