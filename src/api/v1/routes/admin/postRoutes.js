const express = require('express');
const router = express.Router();
const controller = require('../../controllers/PostController');
const authenticate = require('../../middlewares/authenticate');
const authorization = require('../../middlewares/authorization');
const bodyValidator = require('../../middlewares/bodyValidator');
const paramIdValidator = require('../../middlewares/paramsIdValidator');
const schemas = require('../../validations/post');

router.route('/getAll').get(authenticate, authorization('Admin'), controller.fetchAll);
router.route('/get/:id').get(authenticate, authorization('Admin'), paramIdValidator, controller.fetchOneByParamsId);
router.route('/create').put(authenticate, authorization('Admin'), bodyValidator(schemas.createValidation), controller.create);
router.route('/delete/:id').delete(authenticate, authorization('Admin'), paramIdValidator, controller.deleteByParamsId);
router.route('/update/:id').patch(authenticate, authorization('Admin'), paramIdValidator, bodyValidator(schemas.updateValidation), controller.updateByParamsId);
router.route('/addTag/:id').post(authenticate, authorization('Admin'), paramIdValidator, bodyValidator(schemas.addTag), controller.addTag);
router.route('/removeTag/:id').post(authenticate, authorization('Admin'), paramIdValidator, bodyValidator(schemas.removeTag), controller.removeTag);
// TODO: Comment Silme

module.exports = router;