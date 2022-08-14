const BaseService = require('./BaseService');
const Country = require('../models/Country');

class CountryService extends BaseService {
    constructor() {
        super(Country);
    }
}

module.exports = new CountryService();
