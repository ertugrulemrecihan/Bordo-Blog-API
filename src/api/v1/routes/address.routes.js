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
    .route('/get-all/country')
    .get(authenticate, cache(controller), controller.getAllCountries);

router
    .route('/get-all/city/:countryId')
    .get(
        authenticate,
        paramIdValidator,
        cache(controller),
        controller.getAllCitiesByCountryId
    );

router
    .route('/get-all/district/:cityId')
    .get(
        authenticate,
        paramIdValidator,
        cache(controller),
        controller.getAllDistrictsByCityId
    );

router.route('/get-all/my').get(authenticate, controller.getAllMyAddresses);

router
    .route('/get/my/:id')
    .get(authenticate, paramIdValidator, controller.getMyAddress);

router
    .route('/create')
    .post(
        authenticate,
        bodyValidator(schemas.createValidation),
        controller.createMyAddress
    );

router
    .route('/update/:id')
    .patch(
        authenticate,
        paramIdValidator,
        bodyValidator(schemas.updateValidation),
        controller.updateMyAddress
    );

router
    .route('/delete/:id')
    .delete(authenticate, paramIdValidator, controller.deleteMyAddress);

module.exports = router;
