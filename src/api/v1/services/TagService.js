const Tag = require('../models/Tag');
const BaseService = require('./BaseService');

class TagService extends BaseService {
    constructor() {
        super(Tag);
    }
}

module.exports = new TagService();