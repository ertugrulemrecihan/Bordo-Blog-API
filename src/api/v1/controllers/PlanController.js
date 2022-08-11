const BaseController = require('./BaseController');
const PlanService = require('../services/PlanService');

class PlanController extends BaseController {
    constructor() {
        super(PlanService);
    }
}

module.exports = new PlanController();