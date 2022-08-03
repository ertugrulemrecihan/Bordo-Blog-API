const BaseService = require('./BaseService');
const User = require('../models/User');

class UserService extends BaseService {
    constructor() {
        super(User, [{
            path: 'roles',
            select: 'name',
        }]);
    }
}

module.exports = new UserService();