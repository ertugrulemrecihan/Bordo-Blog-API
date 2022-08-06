const EmailVerificationToken = require('../models/EmailVerificationToken');
const BaseService = require('./BaseService');

class EmailVerificationTokenService extends BaseService {
    constructor() {
        super(EmailVerificationToken);
    }
}

module.exports = new EmailVerificationTokenService();