const BaseController = require('./base.controller');
const PlanService = require('../services/plan.service');

class PlanController extends BaseController {
    constructor() {
        super(PlanService);
    }
}

module.exports = new PlanController();
