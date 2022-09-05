const RoleService = require('../services/role.service');
const BaseController = require('./base.controller');

class RoleController extends BaseController {
    constructor() {
        super(RoleService);
    }
}

module.exports = new RoleController();
