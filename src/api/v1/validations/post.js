const Joi = require('joi');

const createValidation = Joi.object({
    title: Joi.string().required().min(10).max(200),
    description: Joi.string().required().min(10).max(375),
    content: Joi.string().required().min(120),
    // images: Joi.array().items(Joi.string().required()),  //! FIXME - Images ve tags field'larını düzelt
    // tags: Joi.array().items(Joi.string().required()),
});

const updateValidation = Joi.object({
    title: Joi.string().min(10).max(200),
    description: Joi.string().min(10).max(375),
    content: Joi.string().min(120),
    // images: Joi.array().items(Joi.string()),
});

const addComment = Joi.object({
    'comment': Joi.string().required(),
});

const deleteComment = Joi.object({
    'comment_id': Joi.string().required()
});

const addTag = Joi.object({
    'tag_id': Joi.string().required().length(24)
});

const removeTag = Joi.object({
    'tag_id': Joi.string().required().length(24)
});

module.exports = {
    createValidation,
    updateValidation,
    addComment,
    addTag,
    removeTag,
    deleteComment
};