const Joi = require('joi');

const createValidation = Joi.object({
    name: Joi.string().required().min(3).max(50)
});

const updateValidation = Joi.object({
    name: Joi.string().required().min(3).max(50)
});

module.exports = {
    createValidation,
    updateValidation
};