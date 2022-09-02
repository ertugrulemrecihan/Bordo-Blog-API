const express = require('express');
const router = express.Router();
const controller = require('../controllers/TagController');
const authenticate = require('../middlewares/authenticate');
const cache = require('../middlewares/cache');
const queryOptions = require('../middlewares/queryOptions');

router
    .route('/get-all')
    .get(
        authenticate,
        queryOptions,
        cache(controller),
        controller.fetchAll
    );
router
    .route('/get-all/most-used/:count')
    .get(
        authenticate,
        cache(controller),
        controller.fetchAllMostUsedTags
    );

module.exports = router;
