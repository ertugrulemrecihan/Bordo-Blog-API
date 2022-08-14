const Address = require('../models/Address');
const BaseService = require('./BaseService');

class AddressService extends BaseService {
    constructor() {
        super(Address, [
            {
                path: 'user_id',
                select: 'first_name last_name email',
            },
            {
                path: 'city_id',
            },
            {
                path: 'country_id',
            },
            {
                path: 'district_id',
            },
        ]);
    }
}

module.exports = new AddressService();
