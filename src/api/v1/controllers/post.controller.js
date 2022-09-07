const BaseController = require('./base.controller');
const postService = require('../services/post.service');
const googleDriveHelper = require('../scripts/helpers/google-drive.helper');
const tagService = require('../services/tag.service');
const paginationHelper = require('../scripts/helpers/pagination.helper');
const ApiError = require('../scripts/responses/error/apiError');
// eslint-disable-next-line max-len
const ApiDataSuccess = require('../scripts/responses/success/apiDataSuccess');
const httpStatus = require('http-status');
const slug = require('slug');
const random = require('random-gen');
const ApiSuccess = require('../scripts/responses/success/apiSuccess');
const commentService = require('../services/comment.service');
const statisticHelper = require('../scripts/helpers/statistics.helper');
const mongoose = require('mongoose');

class PostController extends BaseController {
    constructor() {
        super(postService);
    }

    fetchAllMyPosts = async (req, res, next) => {
        const posts = await postService.fetchAll({
            query: { writer: req.user._id },
            queryOptions: req?.queryOptions,
        });

        const postsStatistics = statisticHelper.postStatistics(posts);

        const response = {
            posts,
            statistics: postsStatistics,
        };

        if (req?.queryOptions?.pagination?.limit) {
            const totalItemCount = await postService.count();

            const paginationInfo = paginationHelper.getPaginationInfo(
                totalItemCount,
                req.queryOptions.pagination?.limit,
                req.queryOptions.pagination?.page
            );

            if (paginationInfo.error) {
                return next(
                    new ApiError(
                        paginationInfo.error.message,
                        paginationInfo.error.code
                    )
                );
            }

            response.paginationInfo = paginationInfo.data;
        }

        ApiDataSuccess.send(
            response,
            'Blogs that user is the author of have been successfully fetched',
            httpStatus.OK,
            res
        );
    };

    fetchOneMyPost = async (req, res, next) => {
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
            res
        );
    };

    // Override
    create = async (req, res, next) => {
        req.body.writer = req.user._id;
        const coverImage = req.files.cover_image;
        const tags = req.body.tags;

        const uploadResponse = await googleDriveHelper.uploadFile(
            coverImage,
            process.env.GOOGLE_POSTS_COVER_IMAGES_FOLDER
        );

        if (!uploadResponse) {
            return next(
                new ApiError(
                    'Cover image upload error. Failed to create post',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        const coverImageBody = {
            url: uploadResponse.imageUrl,
            file_id: uploadResponse.id,
            name: uploadResponse.name,
        };

        const session = await mongoose.startSession();
        session.startTransaction();

        if (tags) {
            for (const tagId of tags) {
                const result = await tagService.updateById(
                    tagId,
                    {
                        $inc: { post_count: 1 },
                    },
                    session
                );

                if (!result) {
                    await session.abortTransaction();
                    await session.endSession();

                    return next(
                        new ApiError(
                            `Tag not found. Tag Id: ${tagId}`,
                            httpStatus.NOT_FOUND
                        )
                    );
                }
            }
        }

        req.body.cover_image = coverImageBody;

        const slugRandom = random.alphaNum(12).toLowerCase();
        const postSlug = slug(`${req.body.title}-${slugRandom}`);

        req.body.slug = postSlug;

        try {
            const response = await postService.create(req.body, session);

            if (!response) {
                await session.abortTransaction();
                await session.endSession();

                return next(
                    new ApiError(
                        'Post creation failed',
                        httpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }

            await session.commitTransaction();
            await session.endSession();

            ApiDataSuccess.send(
                response,
                'Post created successfully',
                httpStatus.CREATED,
                res
            );
        } catch (err) {
            session.abortTransaction();
            await session.endSession();

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

    fetchAllPreviews = async (req, res, next) => {
        const posts = await postService.fetchAll({
            queryOptions: req?.queryOptions,
            select: ['-content', '-images', '-comments'],
        });

        const response = {
            posts,
        };

        if (req?.queryOptions?.pagination?.limit) {
            const totalItemCount = await postService.count();

            const paginationInfo = paginationHelper.getPaginationInfo(
                totalItemCount,
                req.queryOptions.pagination?.limit,
                req.queryOptions.pagination?.page
            );

            if (paginationInfo.error) {
                return next(
                    new ApiError(
                        paginationInfo.error.message,
                        paginationInfo.error.code
                    )
                );
            }

            response.paginationInfo = paginationInfo.data;
        }

        ApiDataSuccess.send(
            response,
            'Posts previews fetched successfully',
            httpStatus.OK,
            res
        );
    };

    deleteMyPost = async (req, res, next) => {
        const postId = req.params.id;

        const post = await postService.fetchOneByQuery({
            _id: postId,
            writer: req.user._id,
        });

        if (!post) {
            return next(new ApiError('Post not found', httpStatus.NOT_FOUND));
        }

        await googleDriveHelper.deleteFile(post.cover_image.file_id);

        const session = await mongoose.startSession();
        session.startTransaction();

        if (post.tags.length > 0) {
            for (const tag of post.tags) {
                const removeTagResult = await tagService.updateById(tag._id, {
                    $inc: { post_count: -1 },
                });

                if (!removeTagResult) {
                    await session.abortTransaction();
                    await session.endSession();

                    return next(
                        new ApiError(
                            // eslint-disable-next-line max-len
                            'Post tags could not be updated. Post could not be deleted',
                            httpStatus.INTERNAL_SERVER_ERROR
                        )
                    );
                }
            }
        }

        const result = await postService.deleteById(post._id, session);

        if (!result) {
            await session.abortTransaction();
            await session.endSession();

            return next(
                new ApiError(
                    'Post deletion failed',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }

        await session.commitTransaction();
        await session.endSession();

        ApiSuccess.send('Post deletion successfully', httpStatus.OK, res);
    };

    updateMyPost = async (req, res, next) => {
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

            if (!uploadResponse) {
                return next(
                    new ApiError(
                        'Cover image upload error. Failed to update post',
                        httpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }

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
            res
        );
    };

    fetchOtherUsersPost = async (req, res, next) => {
        const postId = req.params.id;

        const post = await postService.fetchOneByQuery({
            writer: { $ne: req.user._id },
            _id: postId,
        });
        if (!post) {
            return next(new ApiError('Post not found', httpStatus.NOT_FOUND));
        }

        let addViewerResult = null;

        if (
            !post.viewers.some(
                (user) => user._id.toString() == req.user._id.toString()
            )
        ) {
            addViewerResult = await postService.updateById(post._id, {
                $push: { viewers: req.user._id },
            });
        }

        ApiDataSuccess.send(
            addViewerResult || post,
            'Post fetched successfully',
            httpStatus.OK,
            res
        );
    };

    changeLikeStatus = async (req, res, next) => {
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

        ApiDataSuccess.send(updatedPost, message, httpStatus.OK, res);
    };

    addComment = async (req, res, next) => {
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
            res
        );
    };

    deleteComment = async (req, res, next) => {
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
            res
        );
    };

    fetchAllForAdmin = async (req, res, next) => {
        const posts = await postService.fetchAll({
            queryOptions: req?.queryOptions,
        });

        const postsStatistics = statisticHelper.postStatistics(posts);

        const response = {
            posts,
            statistics: postsStatistics,
        };

        if (req?.queryOptions?.pagination?.limit) {
            const totalItemCount = await postService.count();

            const paginationInfo = paginationHelper.getPaginationInfo(
                totalItemCount,
                req.queryOptions.pagination?.limit,
                req.queryOptions.pagination?.page
            );

            if (paginationInfo.error) {
                return next(
                    new ApiError(
                        paginationInfo.error.message,
                        paginationInfo.error.code
                    )
                );
            }

            response.paginationInfo = paginationInfo.data;
        }

        ApiDataSuccess.send(
            response,
            'Posts fetched successfully',
            httpStatus.OK,
            res
        );
    };
}

module.exports = new PostController();
