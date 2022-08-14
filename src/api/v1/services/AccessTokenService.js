const accessToken = require('../models/AccessToken');
const BaseService = require('./BaseService');

class AccessTokenService extends BaseService {
    constructor() {
        super(accessToken);
    }
}

module.exports = new AccessTokenService();
