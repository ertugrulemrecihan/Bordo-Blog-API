const District = require('../models/district.model');
const BaseService = require('./base.service');

class DistrictService extends BaseService {
    constructor() {
        super(District);
    }
}

module.exports = new DistrictService();
