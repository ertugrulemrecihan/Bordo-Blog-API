const express = require('express');
const router = express.Router();
const controller = require('../../controllers/tag.controller');
const authenticate = require('../../middlewares/authenticate.middleware');
const authorize = require('../../middlewares/authorization.middleware');
const bodyValidator = require('../../middlewares/body-validator.middleware');
const schemas = require('../../validations/tag.validations');
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
    .delete(
        authenticate,
        authorize('Admin'),
        paramIdValidator,
        controller.deleteByParamsId
    );

module.exports = router;
