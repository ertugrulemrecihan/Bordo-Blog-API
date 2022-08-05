const Joi = require('joi');

const createValidations = Joi.object({
    name: Joi.string().required().min(3).max(50),
    description: Joi.string().required().min(3).max(150)
});

const updateValidations = Joi.object({
    name: Joi.string().min(3).max(50),
    description: Joi.string().min(3).max(150)
});

module.exports = {
    createValidations,
    updateValidations
};