const BaseController = require('./BaseController');
const postService = require('../services/PostService');
const userService = require('../services/UserService');
const tagService = require('../services/TagService');
const ApiError = require('../responses/error/apiError');
const ApiDataSuccess = require('../responses/success/apiDataSuccess');
const httpStatus = require('http-status');
const ApiSuccess = require('../responses/success/apiSuccess');

class PostController extends BaseController {
    constructor() {
        super(postService);
    }

    async fetchAllMyPosts(req, res, next) {
        const response = await postService.fetchAll({ writer_id: req.user._id });

        new ApiDataSuccess(response, 'Blogs that the user is the author of have been successfully fetched', httpStatus.OK).place(res);
        return next();
    }

    async fetchOneMyPost(req, res, next) {
        const postId = req.params.id;

        const post = await postService.fetchOneByQuery({ _id: postId, writer_id: req.user._id });
        if (!post) return next(new ApiError('Post not found', httpStatus.NOT_FOUND));

        new ApiDataSuccess(post, 'Post fetched successfully', httpStatus.OK).place(res);
        return next();
    }

    // Override
    create = async (req, res, next) => {
        req.body.writer_id = req.user._id;
        try {
            const response = await postService.create(req.body);

            if (!response) return next(new ApiError('Post creation failed', httpStatus.BAD_REQUEST));

            new ApiDataSuccess(response, 'Post created successfully', httpStatus.OK).place(res);
            return next();
        } catch (err) {
            if (err.code === 11000) return next(new ApiError('Post already exists', httpStatus.CONFLICT));
            return next(new ApiError('Post creation failed', httpStatus.BAD_REQUEST));
        }
    };

    async fetchAllPreviews(req, res, next) {
        const response = await postService.fetchAllBySelect(['-content', '-images', '-comments',]);

        new ApiDataSuccess(response, 'Posts previews fetched successfully', httpStatus.OK).place(res);
        return next();
    }

    async fetchOnePreview(req, res, next) {
        const postId = req.params.id;
        let response = await postService.fetchOneBySelect({ _id: postId }, ['-content', '-images', '-comments',]);

        if (!response) return next(new ApiError('Post not found', httpStatus.NOT_FOUND));

        new ApiDataSuccess(response, 'Post preview fetched successfully', httpStatus.OK).place(res);
        return next();
    }

    async deleteMyPost(req, res, next) {
        const postId = req.params.id;

        const post = await postService.fetchOneByQuery({ _id: postId, writer_id: req.user._id });
        if (!post) return next(new ApiError('Post not found', httpStatus.NOT_FOUND));

        const result = await postService.deleteById(post._id);
        if (!result) return next(new ApiError('Post deleted failed', httpStatus.INTERNAL_SERVER_ERROR));

        new ApiSuccess('Post deleted successfully', httpStatus.OK).place(res);
        return next();
    }

    async updateMyPost(req, res, next) {
        const postId = req.params.id;

        const post = await postService.fetchOneByQuery({ _id: postId, writer_id: req.user._id });
        if (!post) return next(new ApiError('Post not found', httpStatus.NOT_FOUND));

        const result = await postService.updateById(post._id, req.body);
        if (!result) return next(new ApiError('Post updated failed', httpStatus.INTERNAL_SERVER_ERROR));

        new ApiDataSuccess(result, 'Post updated successfully', httpStatus.OK).place(res);
        return next();
    }

    async addView(req, res, next) {
        const postId = req.params.id;

        const post = await postService.fetchOneById(postId);
        if (!post) return next(new ApiError('Post not found', httpStatus.NOT_FOUND));

        const user = await userService.fetchOneById(req.user._id);
        if (!user) return next(new ApiError('User not found', httpStatus.NOT_FOUND));

        const isExists = post.viewers.includes(user._id);

        if (isExists) {
            return next(new ApiError('User has already viewed this post', httpStatus.CONFLICT));
        }

        post.viewers.push(user);

        const updatedPost = await postService.updateById(postId, { viewers: post.viewers });
        if (!updatedPost) return next(new ApiError('There was a problem adding the viewer', httpStatus.BAD_REQUEST));

        new ApiDataSuccess(updatedPost, 'User successfully added to post as viewer', httpStatus.OK).place(res);
        return next();
    }

    async changeLikeStatus(req, res, next) {
        const postId = req.params.id;

        const post = await postService.fetchOneById(postId);
        if (!post) return next(new ApiError('Post not found', httpStatus.NOT_FOUND));

        const user = await userService.fetchOneById(req.user._id);
        if (!user) return next(new ApiError('User not found', httpStatus.NOT_FOUND));

        const index = post.likes.indexOf(req.user._id);
        let message = null;
        if (index > -1) {
            // Unlike
            post.likes.splice(index, 1);
            message = 'User has been successfully removed from the list of likes';
        } else {
            // Like
            post.likes.push(user);
            message = 'User has been successfully added to the list of likes';
        }

        const updatedPost = await postService.updateById(post._id, { likes: post.likes });
        if (!updatedPost) return next(new ApiError('There was a problem changing the like status', httpStatus.INTERNAL_SERVER_ERROR));

        new ApiDataSuccess(updatedPost, message, httpStatus.OK).place(res);
        return next();
    }

    // async addComment(req, res, next) {
    //     //TODO
    // }

    // async deleteComment(req, res, next) {
    //     //TODO
    // }

    async addTag(req, res, next) {
        const postId = req.params.id;
        const tagId = req.body.tag_id;

        const post = await postService.fetchOneByQuery({ _id: postId, writer_id: req.user._id });
        if (!post) return next(new ApiError('Post not found', httpStatus.NOT_FOUND));

        const tag = await tagService.fetchOneById(tagId);
        if (!tag) return next(new ApiError('Tag not found', httpStatus.NOT_FOUND));

        const isExists = post.tags.includes(tagId);

        if (isExists) {
            return next(new ApiError('This post already has this tag', httpStatus.CONFLICT));
        }

        post.tags.push(tagId);

        // ! FIXME: Add transaction
        const updatedPost = await postService.updateById(postId, { tags: post.tags });
        if (!updatedPost) return next(new ApiError('There was a problem adding the tag', httpStatus.INTERNAL_SERVER_ERROR));

        const updatedTag = await tagService.updateById(tagId, { post_count: (tag.post_count + 1) });
        if (!updatedTag) return next(new ApiError('Tag added successfully but tag usage count could not be increased'));

        new ApiDataSuccess(updatedPost, 'Tag added successfully', httpStatus.OK).place(res);
        return next();
    }

    async removeTag(req, res, next) {
        const postId = req.params.id;
        const tagId = req.body.tag_id;

        const post = await postService.fetchOneByQuery({ _id: postId, writer_id: req.user._id });
        if (!post) return next(new ApiError('Post not found', httpStatus.NOT_FOUND));

        const index = post.tags.indexOf(tagId);
        if (index <= -1) return next(new ApiError('Tag not found', httpStatus.NOT_FOUND));

        post.tags.splice(index, 1);

        const updatedPost = await postService.updateById(postId, { tags: post.tags });
        if (!updatedPost) return next(new ApiError('There was a problem deleting the tag', httpStatus.INTERNAL_SERVER_ERROR));

        new ApiDataSuccess(updatedPost, 'Tag removed successfully', httpStatus.OK).place(res);
        return next();
    }
}

module.exports = new PostController();