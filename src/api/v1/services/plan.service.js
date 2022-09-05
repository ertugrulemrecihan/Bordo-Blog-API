const BaseService = require('./base.service');
const Plan = require('../models/plan.model');

class PlanService extends BaseService {
    constructor() {
        super(Plan);
    }
}

module.exports = new PlanService();
