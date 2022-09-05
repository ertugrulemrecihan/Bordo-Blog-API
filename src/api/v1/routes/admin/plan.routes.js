const express = require('express');
const router = express.Router();
const controller = require('../../controllers/plan.controller');
const schemas = require('../../validations/plan.validations');
const authenticate = require('../../middlewares/authenticate.middleware');
const authorize = require('../../middlewares/authorization.middleware');
const bodyValidator = require('../../middlewares/body-validator.middleware');
// eslint-disable-next-line max-len
const paramIdValidator = require('../../middlewares/params-id-validator.middleware');

router
    .route('/')
    .post(
        authenticate,
        authorize('Admin'),
        bodyValidator(schemas.createValidation),
        controller.create
    );

router
    .route('/:id')
    .patch(
        authenticate,
        authorize('Admin'),
        paramIdValidator,
        bodyValidator(schemas.updateValidations),
        controller.updateByParamsId
    );

router
    .route('/:id')
    .delete(
        authenticate,
        authorize('Admin'),
        paramIdValidator,
        controller.deleteByParamsId
    );

module.exports = router;
