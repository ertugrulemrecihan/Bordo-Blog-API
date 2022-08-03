const RoleService = require('../services/RoleSerivce');
const BaseController = require('./BaseController');

class RoleController extends BaseController {
    constructor() {
        super(RoleService);
    }
}

module.exports = new RoleController();