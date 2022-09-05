const BaseService = require('./base.service');
const Country = require('../models/country.model');

class CountryService extends BaseService {
    constructor() {
        super(Country);
    }
}

module.exports = new CountryService();
