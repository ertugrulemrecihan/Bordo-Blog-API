const Comment = require('../models/Comment');
const BaseService = require('./BaseService');

class CommentService extends BaseService {
    constructor() {
        super(Comment);
    }
}

module.exports = new CommentService();
