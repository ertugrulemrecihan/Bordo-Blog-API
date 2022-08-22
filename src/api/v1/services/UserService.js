const BaseService = require('./BaseService');
const User = require('../models/User');

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
