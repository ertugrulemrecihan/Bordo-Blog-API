const Address = require('../models/Address');
const BaseService = require('./BaseService');

class AddressService extends BaseService {
    constructor() {
        super(Address, [
            {
                path: 'user',
                select: 'first_name last_name email',
            },
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
