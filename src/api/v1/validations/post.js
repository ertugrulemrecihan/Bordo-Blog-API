const Joi = require('joi');

const createValidation = Joi.object({
    title: Joi.string().required().min(10).max(200),
    description: Joi.string().required().min(10).max(375),
    content: Joi.string().required().min(120),
    tags: Joi.array().items(Joi.string().required().length(24)),
    cover_image: Joi.allow(),
});

const updateValidation = Joi.object({
    title: Joi.string().min(10).max(200),
    description: Joi.string().min(10).max(375),
    content: Joi.string().min(120),
    cover_image: Joi.allow(),
});

const addComment = Joi.object({
    comment: Joi.string().required(),
});

const deleteComment = Joi.object({
    comment_id: Joi.string().required().length(24),
});

module.exports = {
    createValidation,
    updateValidation,
    addComment,
    deleteComment,
};
