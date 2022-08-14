const httpStatus = require('http-status');
const ApiError = require('../responses/error/apiError');
const ApiDataSuccess = require('../responses/success/apiDataSuccess');
const userService = require('../services/UserService');
const addressService = require('../services/AddressService');
const countryService = require('../services/CountryService');
const cityService = require('../services/CityService');
const districtService = require('../services/DistrictService');
const BaseController = require('./BaseController');

class AddressController extends BaseController {
    constructor() {
        super(addressService);
    }

    async getAllCountries(req, res, next) {
        const countries = await countryService.fetchAll();

        new ApiDataSuccess(
            countries,
            'Countries fetched successfully',
            httpStatus.OK
        ).place(res);

        return next();
    }

    async getAllCitiesByCountryId(req, res, next) {
        const countryId = req.params.countryId;

        const country = await countryService.fetchOneById(countryId);

        if (!country) {
            return next(
                new ApiError('Country not found', httpStatus.NOT_FOUND)
            );
        }

        const cities = await cityService.fetchAll({ country: countryId });

        const response = {
            country: country,
            cities: cities,
        };

        new ApiDataSuccess(
            response,
            'Cities fetched successfully',
            httpStatus.OK
        ).place(res);

        return next();
    }

    async getAllDistrictsByCityId(req, res, next) {
        const cityId = req.params.cityId;

        const city = await cityService.fetchOneById(cityId);

        if (!city) {
            return next(new ApiError('City not found', httpStatus.NOT_FOUND));
        }

        const districts = await districtService.fetchAll({ city: cityId });

        const response = {
            city: city,
            districts: districts,
        };

        new ApiDataSuccess(
            response,
            'Districts fetched successfully',
            httpStatus.OK
        ).place(res);

        return next();
    }

    async getAllMyAddresses(req, res, next) {
        const userId = await req.user._id;

        const addresses = await addressService.fetchAll({ user: userId });

        new ApiDataSuccess(
            addresses,
            'User addresses fetched successfully',
            httpStatus.OK
        ).place(res);

        return next();
    }

    async getMyAddress(req, res, next) {
        const userId = await req.user._id;

        const address = await addressService.fetchOneByQuery({
            user: userId,
            _id: req.params.id,
        });

        if (!address) {
            return next(
                new ApiError('Address not found', httpStatus.NOT_FOUND)
            );
        }

        new ApiDataSuccess(
            address,
            'User address fetched successfully',
            httpStatus.OK
        ).place(res);

        return next();
    }

    // ! FIXME - Refactor Method
    async createAddressForAdmin(req, res, next) {
        const userId = req.body.user;
        const countryId = req.body.country;
        const cityId = req.body.city;
        const districtId = req.body.district;

        const userResult = await userService.fetchOneById(userId);

        if (!userResult) {
            return next(new ApiError('User not found', httpStatus.NOT_FOUND));
        }

        const countryResult = await countryService.fetchOneById(countryId);

        if (!countryResult) {
            return next(
                new ApiError('Country not found', httpStatus.NOT_FOUND)
            );
        }

        const cityResult = await cityService.fetchOneByQuery({
            _id: cityId,
            country: countryId,
        });

        if (!cityResult) {
            return next(new ApiError('City not found', httpStatus.NOT_FOUND));
        }

        const districtResult = await districtService.fetchOneByQuery({
            _id: districtId,
            country: countryId,
            city: cityId,
        });

        if (!districtResult) {
            return next(
                new ApiError('District not found', httpStatus.NOT_FOUND)
            );
        }

        const response = await addressService.create(req.body);

        if (!response) {
            return next(
                new ApiError(
                    'Address creation failed',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        new ApiDataSuccess(
            response,
            'Address created successfully',
            httpStatus.OK
        ).place(res);

        return next();
    }

    // ! FIXME - Refactor Method
    async createMyAddress(req, res, next) {
        req.body.user = req.user._id;
        const countryId = req.body.country;
        const cityId = req.body.city;
        const districtId = req.body.district;

        const countryResult = await countryService.fetchOneById(countryId);

        if (!countryResult) {
            return next(
                new ApiError('Country not found', httpStatus.NOT_FOUND)
            );
        }

        const cityResult = await cityService.fetchOneByQuery({
            _id: cityId,
            country: countryId,
        });

        if (!cityResult) {
            return next(new ApiError('City not found', httpStatus.NOT_FOUND));
        }

        const districtResult = await districtService.fetchOneByQuery({
            _id: districtId,
            country: countryId,
            city: cityId,
        });

        if (!districtResult) {
            return next(
                new ApiError('District not found', httpStatus.NOT_FOUND)
            );
        }

        const response = await addressService.create(req.body);

        if (!response) {
            return next(
                new ApiError(
                    'Address creation failed',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        new ApiDataSuccess(
            response,
            'Address created successfully',
            httpStatus.OK
        ).place(res);

        return next();
    }

    async updateAddressByParamsIdForAdmin(req, res, next) {
        const userId = req.body?.user;
        const countryId = req.body?.country;
        const cityId = req.body?.city;
        const districtId = req.body?.district;

        if (userId) {
            const userResult = await userService.fetchOneById(userId);

            if (!userResult) {
                return next(
                    new ApiError('User not found', httpStatus.NOT_FOUND)
                );
            }
        }

        if (countryId) {
            const countryResult = await countryService.fetchOneById(countryId);

            if (!countryResult) {
                return next(
                    new ApiError('Country not found', httpStatus.NOT_FOUND)
                );
            }
        }

        if (cityId) {
            const cityResult = await cityService.fetchOneById(cityId);

            if (!cityResult) {
                return next(
                    new ApiError('City not found', httpStatus.NOT_FOUND)
                );
            }
        }

        if (districtId) {
            const districtResult = await districtService.fetchOneById(
                districtId
            );

            if (!districtResult) {
                return next(
                    new ApiError('District not found', httpStatus.NOT_FOUND)
                );
            }
        }

        // ! FIXME - İl/ilçe değişimi yapılıyorsa ilgili il
        // ! varolan veya yeni verilen ülkenin bir ili mi,
        // ! ilgili ilçe varolan veya yeni verilen ilin bir ilçesi mi
        // ! kontrolü yapılmalı

        const response = await addressService.updateById(
            req.params.id,
            req.body
        );

        if (!response) {
            return next(
                new ApiError(
                    'Address update failed',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        new ApiDataSuccess(
            response,
            'Address updated successfully',
            httpStatus.OK
        ).place(res);

        return next();
    }

    async updateMyAddress(req, res, next) {
        const userId = req.user._id;
        const response = await addressService.updateByQuery(
            { user: userId, _id: req.params.id },
            req.body
        );

        if (!response) {
            return next(
                new ApiError(
                    'Address update failed',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        new ApiDataSuccess(
            response,
            'Address updated successfully',
            httpStatus.OK
        ).place(res);

        return next();
    }

    async deleteMyAddress(req, res, next) {
        const userId = req.user._id;
        const response = await addressService.deleteByQuery({
            user: userId,
            _id: req.params.id,
        });

        if (!response) {
            return next(
                new ApiError(
                    'Address deletion failed',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        new ApiDataSuccess(
            response,
            'Address deleted successfully',
            httpStatus.OK
        ).place(res);
        return next();
    }
}

module.exports = new AddressController();
