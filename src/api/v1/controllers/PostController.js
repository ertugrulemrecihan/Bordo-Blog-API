const BaseController = require('./BaseController');
const postService = require('../services/PostService');
const googleDriveHelper = require('../scripts/utils/googleDrive');
const tagService = require('../services/TagService');
const paginationHelper = require('../scripts/utils/pagination');
const ApiError = require('../responses/error/apiError');
const ApiDataSuccess = require('../responses/success/apiDataSuccess');
const httpStatus = require('http-status');
const slug = require('slug');
const random = require('random-gen');
const ApiSuccess = require('../responses/success/apiSuccess');
const commentService = require('../services/CommentService');
const statisticHelper = require('../scripts/utils/statistics');

class PostController extends BaseController {
    constructor() {
        super(postService);
    }

    async fetchAllMyPosts(req, res, next) {
        const posts = await postService.fetchAll({
            query: { writer: req.user._id },
        });

        const postsStatistics = statisticHelper.postStatistics(posts);

        const response = {
            posts,
            statistics: postsStatistics,
        };

        ApiDataSuccess.send(
            response,
            'Blogs that user is the author of have been successfully fetched',
            httpStatus.OK,
            res,
            next
        );
    }

    async fetchOneMyPost(req, res, next) {
        const postId = req.params.id;

        const post = await postService.fetchOneByQuery({
            _id: postId,
            writer: req.user._id,
        });

        if (!post) {
            return next(new ApiError('Post not found', httpStatus.NOT_FOUND));
        }

        ApiDataSuccess.send(
            post,
            'Post fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    // Override
    create = async (req, res, next) => {
        req.body.writer = req.user._id;

        const coverImage = req.files.cover_image;

        const tags = req.body.tags;

        if (tags) {
            for (const tagId of tags) {
                const result = await tagService.updateById(tagId, {
                    $inc: { post_count: 1 },
                });
                if (!result) {
                    return next(
                        new ApiError(
                            `Tag not found. Tag Id: ${tagId}`,
                            httpStatus.NOT_FOUND
                        )
                    );
                }
            }
        }

        const uploadResponse = await googleDriveHelper.uploadFile(
            coverImage,
            process.env.GOOGLE_POSTS_COVER_IMAGES_FOLDER
        );

        const coverImageBody = {
            url: uploadResponse.imageUrl,
            file_id: uploadResponse.id,
            name: uploadResponse.name,
        };

        req.body.cover_image = coverImageBody;

        const slugRandom = random.alphaNum(12).toLowerCase();
        const postSlug = slug(`${req.body.title}-${slugRandom}`);

        req.body.slug = postSlug;

        try {
            const response = await postService.create(req.body);

            if (!response) {
                return next(
                    new ApiError(
                        'Post creation failed',
                        httpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }

            ApiDataSuccess.send(
                response,
                'Post created successfully',
                httpStatus.CREATED,
                res,
                next
            );
        } catch (err) {
            if (err.code === 11000) {
                return next(
                    new ApiError(
                        'Post slug already exists',
                        httpStatus.CONFLICT
                    )
                );
            }
            return next(
                new ApiError(
                    'Post creation failed',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }
    };

    async fetchAllPreviews(req, res, next) {
        const response = await postService.fetchAll({
            select: ['-content', '-images', '-comments'],
        });

        ApiDataSuccess.send(
            response,
            'Posts previews fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async deleteMyPost(req, res, next) {
        const postId = req.params.id;

        const post = await postService.fetchOneByQuery({
            _id: postId,
            writer: req.user._id,
        });

        if (!post) {
            return next(new ApiError('Post not found', httpStatus.NOT_FOUND));
        }

        await googleDriveHelper.deleteFile(post.cover_image.file_id);

        const result = await postService.deleteById(post._id);

        if (!result) {
            return next(
                new ApiError(
                    'Post deletion failed',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        ApiSuccess.send('Post deletion successfully', httpStatus.OK, res, next);
    }

    async updateMyPost(req, res, next) {
        const postId = req.params.id;

        const post = await postService.fetchOneByQuery({
            _id: postId,
            writer: req.user._id,
        });

        if (!post) {
            return next(new ApiError('Post not found', httpStatus.NOT_FOUND));
        }

        const coverImage = req.files?.cover_image;

        if (coverImage) {
            if (post.cover_image.url) {
                await googleDriveHelper.deleteFile(post.cover_image.file_id);
            }

            const uploadResponse = await googleDriveHelper.uploadFile(
                coverImage,
                process.env.GOOGLE_POSTS_COVER_IMAGES_FOLDER
            );

            const coverImageBody = {
                url: uploadResponse.imageUrl,
                file_id: uploadResponse.id,
                name: uploadResponse.name,
            };

            req.body.cover_image = coverImageBody;
        }

        if (req.body.title) {
            const slugRandom = random.alphaNum(12).toLowerCase();
            const postSlug = slug(`${req.body.title}-${slugRandom}`);

            req.body.slug = postSlug;
        }

        const result = await postService.updateById(post._id, req.body);

        if (!result) {
            return next(
                new ApiError(
                    'Post update failed',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        ApiDataSuccess.send(
            result,
            'Post update successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async addView(req, res, next) {
        const postId = req.params.id;

        const post = await postService.fetchOneById(postId);
        if (!post) {
            return next(new ApiError('Post not found', httpStatus.NOT_FOUND));
        }

        const isExists = post.viewers.some(
            (u) => u._id.toString() == req.user._id.toString()
        );

        if (isExists) {
            return next(
                new ApiError(
                    'User has already viewed this post',
                    httpStatus.CONFLICT
                )
            );
        }

        post.viewers.push(req.user);

        const updatedPost = await postService.updateById(postId, {
            viewers: post.viewers,
        });

        if (!updatedPost) {
            return next(
                new ApiError(
                    'There was a problem adding the viewer',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        ApiDataSuccess.send(
            updatedPost,
            'User successfully added to post as viewer',
            httpStatus.OK,
            res,
            next
        );
    }

    async changeLikeStatus(req, res, next) {
        const postId = req.params.id;

        const post = await postService.fetchOneById(postId);
        if (!post) {
            return next(new ApiError('Post not found', httpStatus.NOT_FOUND));
        }

        const index = post.likes.findIndex(
            (o) => o._id.toString() == req.user._id.toString()
        );
        let message = null;

        if (index > -1) {
            // * Unlike
            post.likes.splice(index, 1);
            message =
                'User has been successfully removed from the list of likes';
        } else {
            // * Like
            post.likes.push(req.user);
            message = 'User has been successfully added to the list of likes';
        }

        const updatedPost = await postService.updateById(post._id, {
            likes: post.likes,
        });

        if (!updatedPost) {
            return next(
                new ApiError(
                    'There was a problem changing the like status',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        ApiDataSuccess.send(updatedPost, message, httpStatus.OK, res, next);
    }

    async addComment(req, res, next) {
        const postId = req.params.id;

        const post = await postService.fetchOneById(postId);
        if (!post) {
            return next(new ApiError('Post not found', httpStatus.NOT_FOUND));
        }

        const comment = await commentService.create({
            user_id: req.user._id,
            comment: req.body.comment,
        });

        const updatedPost = await postService.updateById(postId, {
            $push: { comments: comment },
        });

        if (!updatedPost) {
            return next(
                new ApiError(
                    'There was a problem adding the comment',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        ApiDataSuccess.send(
            updatedPost,
            'Comment added successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async deleteComment(req, res, next) {
        const postId = req.params.id;
        const commentId = req.body.comment_id;

        const post = await postService.fetchOneById(postId);
        if (!post) {
            return next(new ApiError('Post not found', httpStatus.NOT_FOUND));
        }

        const index = post.comments.findIndex((o) => o._id == commentId);
        if (index <= -1) {
            return next(
                new ApiError('Comment not found', httpStatus.NOT_FOUND)
            );
        }

        post.comments.splice(index, 1);

        await commentService.deleteById(commentId);

        const deletedComment = await postService.updateById(postId, {
            comments: post.comments,
        });

        if (!deletedComment) {
            return next(
                new ApiError(
                    'There was a problem deleting the comment',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        ApiDataSuccess.send(
            deletedComment,
            'Comment deleted successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async fetchAllPostsWithSortByQuery(req, res, next) {
        const fieldName = req.query.fieldName;

        const fields = Object.keys(postService.model.schema.paths);

        const isExistField = paginationHelper.isValidSortField(
            fieldName,
            fields
        );

        if (!isExistField) {
            return next(
                new ApiError(
                    'The field specified in the query was not found',
                    httpStatus.NOT_FOUND
                )
            );
        }

        const posts = await postService.fetchAll({ sortQuery: fieldName });

        const postStatistics = statisticHelper.postStatistics(posts);

        const response = {
            posts,
            statistics: postStatistics,
        };

        ApiDataSuccess.send(
            response,
            'Posts fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async fetchAllPostsByLimit(req, res, next) {
        const fieldName = req.query?.fieldName;

        if (fieldName) {
            const fields = Object.keys(postService.model.schema.paths);

            const isExistField = paginationHelper.isValidSortField(
                fieldName,
                fields
            );

            if (!isExistField) {
                return next(
                    new ApiError(
                        'The field specified in the query was not found',
                        httpStatus.NOT_FOUND
                    )
                );
            }
        }

        const pageMaxItem = req.query.limit == null ? 10 : req.query.limit;
        const pageNumber = req.query.page == null ? 1 : req.query.page;
        const startPage = (pageNumber - 1) * pageMaxItem;

        const posts = await postService.fetchAll({
            sortQuery: fieldName,
            limit: pageMaxItem,
            skip: startPage,
        });

        const postStatistics = statisticHelper.postStatistics(posts);

        const response = {
            posts,
            statistics: postStatistics,
        };

        ApiDataSuccess.send(
            response,
            'Posts fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async fetchAllMyPostsWithSortByQuery(req, res, next) {
        const fieldName = req.query.fieldName;

        const fields = Object.keys(postService.model.schema.paths);

        const isExistField = paginationHelper.isValidSortField(
            fieldName,
            fields
        );

        if (!isExistField) {
            return next(
                new ApiError(
                    'The field specified in the query was not found',
                    httpStatus.NOT_FOUND
                )
            );
        }

        const posts = await postService.fetchAll({
            query: { writer: req.user._id },
            sortQuery: fieldName,
        });

        const postsStatistics = statisticHelper.postStatistics(posts);

        const response = {
            posts,
            statistics: postsStatistics,
        };

        ApiDataSuccess.send(
            response,
            'Posts fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async fetchAllMyPostsByLimit(req, res, next) {
        const fieldName = req.query?.fieldName;

        if (fieldName) {
            const fields = Object.keys(postService.model.schema.paths);

            const isExistField = paginationHelper.isValidSortField(
                fieldName,
                fields
            );

            if (!isExistField) {
                return next(
                    new ApiError(
                        'The field specified in the query was not found',
                        httpStatus.NOT_FOUND
                    )
                );
            }
        }

        const pageMaxItem = req.query.limit == null ? 10 : req.query.limit;
        const pageNumber = req.query.page == null ? 1 : req.query.page;
        const startPage = (pageNumber - 1) * pageMaxItem;

        const posts = await postService.fetchAll({
            query: { writer: req.user._id },
            sortQuery: fieldName,
            limit: pageMaxItem,
            skip: startPage,
        });

        const postStatistics = statisticHelper.postStatistics(posts);

        const response = {
            posts,
            statistics: postStatistics,
        };

        ApiDataSuccess.send(
            response,
            'Posts fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }

    async fetchAllForAdmin(req, res, next) {
        const posts = await postService.fetchAll();

        const postsStatistics = statisticHelper.postStatistics(posts);

        const response = {
            posts,
            statistics: postsStatistics,
        };

        ApiDataSuccess.send(
            response,
            'Posts fetched successfully',
            httpStatus.OK,
            res,
            next
        );
    }
}

module.exports = new PostController();
