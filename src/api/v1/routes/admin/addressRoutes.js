const express = require('express');
const authorization = require('../../middlewares/authorization');
const router = express.Router();
const controller = require('../../controllers/AddressController');
const authenticate = require('../../middlewares/authenticate');
const bodyValidator = require('../../middlewares/bodyValidator');
const paramIdValidator = require('../../middlewares/paramsIdValidator');
const schemas = require('../../validations/address');

router.route('/getAll').get(authenticate, authorization('Admin'), controller.fetchAll);
router.route('/get/:id').get(authenticate, authorization('Admin'), paramIdValidator, controller.fetchOneByParamsId);
router.route('/create').put(authenticate, authorization('Admin'), bodyValidator(schemas.creatAdminValidation), controller.create);
router.route('/update/:id').patch(authenticate, authorization('Admin'), paramIdValidator, bodyValidator(schemas.updateAdminValidation), controller.updateByParamsId);
router.route('/delete/:id').delete(authenticate, authorization('Admin'), paramIdValidator, controller.deleteByParamsId);

module.exports = router;