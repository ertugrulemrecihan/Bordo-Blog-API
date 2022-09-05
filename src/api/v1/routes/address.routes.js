const express = require('express');
const router = express.Router();
const controller = require('../controllers/address.controller');
const authenticate = require('../middlewares/authenticate.middleware');
const bodyValidator = require('../middlewares/body-validator.middleware');
const schemas = require('../validations/address.validations');
const cache = require('../middlewares/cache.middleware');
// eslint-disable-next-line max-len
const paramIdValidator = require('../middlewares/params-id-validator.middleware');

router
    .route('/countries')
    .get(authenticate, cache(controller), controller.getAllCountries);

router
    .route('/:countryId/cities')
    .get(
        authenticate,
        paramIdValidator,
        cache(controller),
        controller.getAllCitiesByCountryId
    );

router
    .route('/:cityId/districts')
    .get(
        authenticate,
        paramIdValidator,
        cache(controller),
        controller.getAllDistrictsByCityId
    );

router.route('/').get(authenticate, controller.getAllMyAddresses);

router
    .route('/:id')
    .get(authenticate, paramIdValidator, controller.getMyAddress);

router
    .route('/')
    .post(
        authenticate,
        bodyValidator(schemas.createValidation),
        controller.createMyAddress
    );

router
    .route('/:id')
    .patch(
        authenticate,
        paramIdValidator,
        bodyValidator(schemas.updateValidation),
        controller.updateMyAddress
    );

router
    .route('/:id')
    .delete(authenticate, paramIdValidator, controller.deleteMyAddress);

module.exports = router;
