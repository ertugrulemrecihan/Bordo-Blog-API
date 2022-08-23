const express = require('express');
const router = express.Router();
const controller = require('../../controllers/PostController');
const authenticate = require('../../middlewares/authenticate');
const authorization = require('../../middlewares/authorization');
const paramIdValidator = require('../../middlewares/paramsIdValidator');
const queryValidator = require('../../middlewares/queryValidator');

router
    .route('/get-all')
    .get(authenticate, authorization('Admin'), controller.fetchAllForAdmin);
router
    .route('/get/:id')
    .get(
        authenticate,
        authorization('Admin'),
        paramIdValidator,
        controller.fetchOneByParamsId
    );
router
    .route('/get-all/sort')
    .get(
        authenticate,
        authorization('Admin'),
        queryValidator('fieldName'),
        controller.fetchAllPostsSortByQuery
    );
router
    .route('/get-by-limit')
    .get(
        authenticate,
        authorization('Admin'),
        controller.fetchPostsByLimit
    );     
router
    .route('/delete/:id')
    .delete(
        authenticate,
        authorization('Admin'),
        paramIdValidator,
        controller.deleteByParamsId
    );
// TODO: Comment Silme

module.exports = router;
