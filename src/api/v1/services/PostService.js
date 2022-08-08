const Post = require('../models/Post');
const BaseService = require('./BaseService');

class PostService extends BaseService {
    constructor() {
        super(Post, [{
            path: 'comments'
        }, {
            path: 'likes',
            select: 'first_name last_name email'
        }, {
            path: 'tags'
        }]);
    }

    fetchAllBySelect(select) {
        return Post.find().select(select);
    }

    fetchOneBySelect(query, select) {
        return Post.findOne(query).select(select);
    }
}

module.exports = new PostService();