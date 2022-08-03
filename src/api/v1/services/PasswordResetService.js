const BaseService = require("./BaseService");
const PasswordReset = require("../models/PasswordReset");

class PasswordResetService extends BaseService {
    constructor() {
        super(PasswordReset);
    }
}

module.exports = new PasswordResetService();