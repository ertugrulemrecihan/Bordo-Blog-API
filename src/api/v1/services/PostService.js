const Post = require("../models/Post");
const BaseService = require("./BaseService");

class PostService extends BaseService {
    constructor() {
        super(Post);
    }

    fetchAllBySelect(select) {
        return Post.find().select(select);
    }

    fetchOneBySelect(query, select) {
        return Post.findOne(query).select(select);
    }
}

module.exports = new PostService();