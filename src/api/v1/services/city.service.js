const City = require('../models/city.model');
const BaseService = require('./base.service');

class CityService extends BaseService {
    constructor() {
        super(City);
    }
}

module.exports = new CityService();
