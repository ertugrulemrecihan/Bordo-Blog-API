// eslint-disable-next-line max-len
const EmailVerificationToken = require('../models/email-verification-token.model');
const BaseService = require('./base.service');

class EmailVerificationTokenService extends BaseService {
    constructor() {
        super(EmailVerificationToken);
    }
}

module.exports = new EmailVerificationTokenService();
