const Address = require('../models/Address');
const BaseService = require('./BaseService');

class AddressService extends BaseService {
    constructor() {
        // ! FIXME - User populate'e sadece Admin get-all'da ihtiyaç var.
        // ! Metod bazlı populate eklendiğinde bunu kaldır.
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
