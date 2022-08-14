const BaseService = require('./BaseService');
const PasswordResetToken = require('../models/PasswordResetToken');

class PasswordResetTokenService extends BaseService {
    constructor() {
        super(PasswordResetToken);
    }
}

module.exports = new PasswordResetTokenService();
