const express = require('express');
const router = express.Router();
const controller = require('../../controllers/PlanController');
const schemas = require('../../validations/plan');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorization');
const bodyValidator = require('../../middlewares/bodyValidator');
const paramIdValidator = require('../../middlewares/paramsIdValidator');

router.route('/getAll').get(authenticate, authorize('Admin'), controller.fetchAllByQuery);
router.route('/get/:id').get(authenticate, authorize('Admin'), paramIdValidator, controller.fetchOneByParamsId);
router.route('/create').put(authenticate, authorize('Admin'), bodyValidator(schemas.createValidation), controller.create);
router.route('/update/:id').patch(authenticate, authorize('Admin'), paramIdValidator, bodyValidator(schemas.updateValidations), controller.updateByParamsId);
router.route('/delete/:id').delete(authenticate, authorize('Admin'), paramIdValidator, controller.deleteByParamsId);

module.exports = router;
