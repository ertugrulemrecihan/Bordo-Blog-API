const Address = require('../models/address.model');
const BaseService = require('./base.service');

class AddressService extends BaseService {
    constructor() {
        super(Address, [
            {
                path: 'city',
            },
            {
                path: 'country',
            },
            {
                path: 'district',
            },
        ]);
    }
}

module.exports = new AddressService();
