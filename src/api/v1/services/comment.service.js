const Comment = require('../models/comment.model');
const BaseService = require('./base.service');

class CommentService extends BaseService {
    constructor() {
        super(Comment);
    }
}

module.exports = new CommentService();
