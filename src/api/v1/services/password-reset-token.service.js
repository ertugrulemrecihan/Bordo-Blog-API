const BaseService = require('./base.service');
const PasswordResetToken = require('../models/password-reset-token.model');

class PasswordResetTokenService extends BaseService {
    constructor() {
        super(PasswordResetToken);
    }
}

module.exports = new PasswordResetTokenService();
