const Role = require('../models/Role');
const BaseService = require('./BaseService');

class RoleService extends BaseService {
    constructor() {
        super(Role);
    }
}
module.exports = new RoleService();
