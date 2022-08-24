const express = require('express');
const router = express.Router();
const controller = require('../controllers/TagController');
const authenticate = require('../middlewares/authenticate');

router
    .route('/get-all')
    .get(
        authenticate,
        controller.fetchAll
    );
router
    .route('/get-all/most-used/:count')
    .get(
        authenticate,
        controller.fetchAllMostUsedTags
    );

module.exports = router;
