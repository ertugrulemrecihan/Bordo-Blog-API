const Joi = require('joi');

const createValidation = Joi.object({
    city: Joi.string().required(),
    country: Joi.string().required(),
    district: Joi.string().required(),
    address_1: Joi.string().required().min(10).max(200),
    address_2: Joi.string().min(10).max(200),
});

const updateValidation = Joi.object({
    city: Joi.string(),
    country: Joi.string(),
    district: Joi.string(),
    address_1: Joi.string().min(10).max(200),
    address_2: Joi.string().min(10).max(200),
});

module.exports = {
    createValidation,
    updateValidation,
};
