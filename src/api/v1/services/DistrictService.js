const District = require('../models/District');
const BaseService = require('./BaseService');

class DistrictService extends BaseService {
    constructor() {
        super(District);
    }
}

module.exports = new DistrictService();
