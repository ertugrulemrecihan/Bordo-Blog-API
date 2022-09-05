const Role = require('../models/role.model');
const BaseService = require('./base.service');

class RoleService extends BaseService {
    constructor() {
        super(Role);
    }
}
module.exports = new RoleService();
