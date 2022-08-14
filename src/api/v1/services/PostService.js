const Post = require('../models/Post');
const BaseService = require('./BaseService');

class PostService extends BaseService {
    constructor() {
        const populate = [
            {
                path: 'comments',
                populate: {
                    path: 'user_id',
                    select: 'first_name last_name email',
                },
            },
            {
                path: 'likes',
                select: 'first_name last_name email',
            },
            {
                path: 'tags',
            },
            {
                path: 'viewers',
                select: 'first_name last_name email',
            },
            {
                path: 'writer',
                select: 'first_name last_name email',
            },
        ];
        super(Post, populate);
        this.populate = populate;
    }

    fetchAllBySelect(select) {
        return Post.find().select(select).populate(this.populate);
    }

    fetchOneBySelect(query, select) {
        return Post.findOne(query).select(select).populate(this.populate);
    }
}

module.exports = new PostService();
