const refreshToken = require('../models/refresh-token.model');
const BaseService = require('./base.service');

class RefreshTokenService extends BaseService {
    constructor() {
        super(refreshToken);
    }
}

module.exports = new RefreshTokenService();
