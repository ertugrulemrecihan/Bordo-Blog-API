const accessToken = require('../models/access-token.model');
const BaseService = require('./base.service');

class AccessTokenService extends BaseService {
    constructor() {
        super(accessToken);
    }
}

module.exports = new AccessTokenService();
