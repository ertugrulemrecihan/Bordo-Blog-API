const Post = require('../models/post.model');
const BaseService = require('./base.service');

class PostService extends BaseService {
    constructor() {
        const populate = [
            {
                path: 'comments',
                populate: {
                    path: 'user_id',
                    select: 'first_name last_name email avatar',
                },
            },
            {
                path: 'likes',
                select: 'first_name last_name email avatar',
            },
            {
                path: 'tags',
            },
            {
                path: 'viewers',
                select: 'first_name last_name email avatar',
            },
            {
                path: 'writer',
                select: 'first_name last_name email avatar',
            },
        ];
        super(Post, populate);
        this.populate = populate;
    }
}

module.exports = new PostService();
