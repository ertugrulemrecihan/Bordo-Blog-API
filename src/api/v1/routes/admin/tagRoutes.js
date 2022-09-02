const express = require('express');
const router = express.Router();
const controller = require('../../controllers/TagController');
const authenticate = require('../../middlewares/authenticate');
const authorization = require('../../middlewares/authorization');
const authorize = require('../../middlewares/authorization');
const bodyValidator = require('../../middlewares/bodyValidator');
const paramIdValidator = require('../../middlewares/paramsIdValidator');
const queryValidator = require('../../middlewares/queryValidator');
const queryOptions = require('../../middlewares/queryOptions');
const schemas = require('../../validations/tag');
const cache = require('../../middlewares/cache');

router
    .route('/create')
    .post(
        authenticate,
        authorize('Admin'),
        bodyValidator(schemas.createValidation),
        controller.create
    );
// router
//     .route('/get-all/sort')
//     .get(
//         authenticate,
//         authorization('Admin'),
//         queryValidator('fieldName'),
//         cache(controller),
//         controller.fetchAllTagsWithSortByQuery
//     );
// router
//     .route('/get-all/limit')
//     .get(
//         authenticate,
//         authorization('Admin'),
//         cache(controller),
//         controller.fetchAllTagsByLimit
//     );
router
    .route('/delete/:id')
    .delete(
        authenticate,
        authorize('Admin'),
        paramIdValidator,
        controller.deleteByParamsId
    );

module.exports = router;
