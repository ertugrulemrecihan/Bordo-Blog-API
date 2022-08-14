const BaseService = require('./BaseService');
const Plan = require('../models/Plan');

class PlanService extends BaseService {
    constructor() {
        super(Plan);
    }
}

module.exports = new PlanService();
