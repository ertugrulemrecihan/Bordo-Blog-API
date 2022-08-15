const Joi = require('joi');

const createValidation = Joi.object({
    name: Joi.string().required().min(3).max(150),
    description: Joi.string().required().min(3).max(350),
    price: Joi.number().required().min(0),
    right_to_view: Joi.number().required().min(1),
});

const updateValidations = Joi.object({
    name: Joi.string().min(3).max(150),
    description: Joi.string().min(3).max(350),
    price: Joi.number().min(0),
    right_to_view: Joi.number().min(1),
});

module.exports = {
    createValidation,
    updateValidations,
};
