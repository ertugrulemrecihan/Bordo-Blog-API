const express = require('express');
const router = express.Router();
const controller = require('../controllers/tag.controller');
const authenticate = require('../middlewares/authenticate.middleware');
const cache = require('../middlewares/cache.middleware');
const queryOptions = require('../middlewares/query-options.middleware');

router
    .route('/')
    .get(authenticate, queryOptions, cache(controller), controller.fetchAll);

router
    .route('/most-used/:count')
    .get(authenticate, cache(controller), controller.fetchAllMostUsedTags);

module.exports = router;
