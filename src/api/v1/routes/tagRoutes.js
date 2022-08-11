const express = require('express');
const router = express.Router();
const controller = require('../controllers/TagController');
const authenticate = require('../middlewares/authenticate');
const paramIdValidator = require('../middlewares/paramsIdValidator');

router.route('/getAll').get(authenticate, controller.fetchAll);
router.route('/get/:id').get(authenticate, paramIdValidator, controller.fetchOneByParamsId);

module.exports = router;