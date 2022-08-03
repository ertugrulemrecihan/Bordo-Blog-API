const EmailVerify = require('../models/EmailVerify');
const BaseService = require('./BaseService')

class EmailVerifyService extends BaseService {
    constructor() {
        super(EmailVerify);
    }
}

module.exports = new EmailVerifyService();