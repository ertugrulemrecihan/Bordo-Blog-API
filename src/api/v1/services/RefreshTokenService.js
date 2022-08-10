const refreshToken = require('../models/RefreshToken');
const BaseService = require('./BaseService');

class RefreshTokenService extends BaseService {
    constructor() {
        super(refreshToken);
    }
}

module.exports = new RefreshTokenService();