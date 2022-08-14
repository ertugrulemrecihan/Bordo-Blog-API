const express = require('express');
const router = express.Router();
const controller = require('../controllers/TagController');
const paramIdValidator = require('../middlewares/paramsIdValidator');

router.route('/getAll').get(controller.fetchAll);
router
    .route('/get/:id')
    .get(paramIdValidator, controller.fetchOneByParamsId);

module.exports = router;
