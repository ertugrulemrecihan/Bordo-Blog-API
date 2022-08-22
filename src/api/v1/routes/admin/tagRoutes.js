const express = require('express');
const router = express.Router();
const controller = require('../../controllers/TagController');
const authenticate = require('../../middlewares/authenticate');
const authorization = require('../../middlewares/authorization');
const authorize = require('../../middlewares/authorization');
const bodyValidator = require('../../middlewares/bodyValidator');
const paramIdValidator = require('../../middlewares/paramsIdValidator');
const queryValidator = require('../../middlewares/queryValidator');
const schemas = require('../../validations/tag');

router
    .route('/create')
    .post(
        authenticate,
        authorize('Admin'),
        bodyValidator(schemas.createValidation),
        controller.create
    );
router
    .route('/update/:id')
    .patch(
        authenticate,
        authorize('Admin'),
        paramIdValidator,
        bodyValidator(schemas.updateValidation),
        controller.updateByParamsId
    );
router
    .route('/get-all/sort')
    .get(
        authenticate,
        authorization('Admin'),
        queryValidator('fieldName'),
        controller.fetchAllTagsSortByQuery
    );
router
    .route('/get-by-limit')
    .get(
        authenticate,
        authorization('Admin'),
        controller.fetchTagsByLimit
    );     
router
    .route('/delete/:id')
    .delete(
        authenticate,
        authorize('Admin'),
        paramIdValidator,
        controller.deleteByParamsId
    );

module.exports = router;
