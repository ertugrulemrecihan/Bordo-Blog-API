const express = require('express');
const router = express.Router();
const controller = require('../controllers/AddressController');
const authenticate = require('../middlewares/authenticate');
const bodyValidator = require('../middlewares/bodyValidator');
const paramIdValidator = require('../middlewares/paramsIdValidator');
const schemas = require('../validations/address');

router.route('/getAll/my').get(authenticate, controller.getAllMyAddresses);
router.route('/getAll/my/:id').get(authenticate, controller.getMyAddress);
router.route('/create').put(authenticate, bodyValidator(schemas.createValidation), controller.createMyAddress);
router.route('/update/:id').patch(authenticate, paramIdValidator, bodyValidator(schemas.updateValidation), controller.updateMyAddress);
router.route('/delete/:id').delete(authenticate, paramIdValidator, controller.deleteMyAddress);

module.exports = router;