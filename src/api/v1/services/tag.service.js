const Tag = require('../models/tag.model');
const BaseService = require('./base.service');

class TagService extends BaseService {
    constructor() {
        super(Tag);
    }
}

module.exports = new TagService();
