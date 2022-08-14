const express = require('express');
const router = express.Router();
const controller = require('../../controllers/UserController');
const authenticate = require('../../middlewares/authenticate');
const authorization = require('../../middlewares/authorization');
const paramsIdValidator = require('../../middlewares/paramsIdValidator');
const bodyValidator = require('../../middlewares/bodyValidator');
const schemas = require('../../validations/user');

router
    .route('/getAll')
    .get(
        authenticate,
        authorization('Admin'),
        controller.fetchAll
    );
router
    .route('/get/:id')
    .get(
        authenticate,
        authorization('Admin'),
        paramsIdValidator,
        controller.fetchOneByParamsId
    );
router
    .route('/delete/:id')
    .delete(
        authenticate,
        authorization('Admin'),
        paramsIdValidator,
        controller.deleteByParamsId
    );
router
    .route('/update/:id')
    .patch(
        authenticate,
        authorization('Admin'),
        paramsIdValidator,
        bodyValidator(schemas.adminUserUpdateValidation),
        controller.updateByParamsId
    );

module.exports = router;
