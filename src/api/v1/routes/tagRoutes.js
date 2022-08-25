const express = require('express');
const router = express.Router();
const controller = require('../controllers/TagController');
const authenticate = require('../middlewares/authenticate');
const cache = require('../middlewares/cache');

router
    .route('/get-all')
    .get(
        authenticate,
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
