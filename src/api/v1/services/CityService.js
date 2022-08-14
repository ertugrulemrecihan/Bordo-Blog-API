const City = require('../models/City');
const BaseService = require('./BaseService');

class CityService extends BaseService {
    constructor() {
        super(City);
    }
}

module.exports = new CityService();
