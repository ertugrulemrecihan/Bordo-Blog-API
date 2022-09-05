const BaseService = require('./base.service');
const User = require('../models/user.model');

class UserService extends BaseService {
    constructor() {
        super(User, [
            {
                path: 'roles',
                select: 'name',
            },
            { path: 'plan', select: 'name right_to_view' },
        ]);
    }
}

module.exports = new UserService();
