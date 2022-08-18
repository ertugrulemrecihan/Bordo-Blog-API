const RoleService = require('../services/RoleService');
const BaseController = require('./BaseController');

class RoleController extends BaseController {
    constructor() {
        super(RoleService);
    }
}

module.exports = new RoleController();
