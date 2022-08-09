const httpStatus = require('http-status');
const ApiError = require('../responses/error/apiError');
const ApiDataSuccess = require('../responses/success/apiDataSuccess');
const addressService = require('../services/AddressService');
const BaseController = require('./BaseController');

class AddressController extends BaseController {
    constructor() {
        super(addressService);
    }

    async getAllMyAddresses(req, res, next) {
        const userId = await req.user._id;

        const addresses = await addressService.fetchAll({ user_id: userId });
        new ApiDataSuccess(addresses, 'User addresses fetched successfuly', httpStatus.OK).place(res);
        return next();
    }

    async getMyAddress(req, res, next) {
        const userId = await req.user._id;

        const addresses = await addressService.fetchOneByQuery({ user_id: userId, id: req.params.id });
        new ApiDataSuccess(addresses, 'User address fetched successfuly', httpStatus.OK).place(res);
        return next();
    }

    // FIXME - REafactor Method
    async createMyAddress(req, res, next) {
        try {
            req.body.user_id = req.user._id;
            const response = await addressService.create(req.body);
            console.log(response);

            if (!response) return next(new ApiError('Address creation failed', httpStatus.BAD_REQUEST));

            new ApiDataSuccess(response, 'Address created successfully', httpStatus.OK).place(res);
            return next();
        } catch (err) {
            if (err.code === 11000) return next(new ApiError('Address already exists', httpStatus.CONFLICT));
            console.log('err', err);
            return next(new ApiError('Address creation failed', httpStatus.BAD_REQUEST));
        }
    }

    async updateMyAddress(req, res, next) {
        const userId = req.user._id;
        const response = await addressService.updateByQuery({ user_id: userId, _id: req.params.id }, req.body);
        if (!response) return next(new ApiError('Address update failed', httpStatus.BAD_REQUEST));

        new ApiDataSuccess(response, 'Address updated successfully', httpStatus.OK).place(res);
        return next();
    }

    async deleteMyAddress(req, res, next) {
        const userId = req.user._id;
        const response = await addressService.deleteByQuery({ user_id: userId, _id: req.params.id });

        if (!response) return next(new ApiError('Address deletion failed', httpStatus.BAD_REQUEST));

        new ApiDataSuccess(response, 'Address deleted successfully', httpStatus.OK).place(res);
        return next();
    }
}

module.exports = new AddressController();