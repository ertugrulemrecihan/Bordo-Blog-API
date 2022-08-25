const Address = require('../models/Address');
const BaseService = require('./BaseService');

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
