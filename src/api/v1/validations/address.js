const Joi = require('joi');

const createValidation = Joi.object({
    city_id: Joi.string().required(),
    country_id: Joi.string().required(),
    district_id: Joi.string().required(),
    address_1: Joi.string().required().min(10).max(200),
    address_2: Joi.string().min(10).max(200)
});

const updateValidation = Joi.object({
    city_id: Joi.string(),
    country_id: Joi.string(),
    district_id: Joi.string(),
    address_1: Joi.string().min(10).max(200),
    address_2: Joi.string().min(10).max(200)
});

const creatAdminValidation = Joi.object({
    user_id: Joi.string().required(),
    city_id: Joi.string().required(),
    country_id: Joi.string().required(),
    district_id: Joi.string().required(),
    address_1: Joi.string().required().min(10).max(200),
    address_2: Joi.string().min(10).max(200)
});

const updateAdminValidation = Joi.object({
    user_id: Joi.string(),
    city_id: Joi.string(),
    country_id: Joi.string(),
    district_id: Joi.string(),
    address_1: Joi.string().min(10).max(200),
    address_2: Joi.string().min(10).max(200)
});

module.exports = {
    createValidation,
    updateValidation,
    creatAdminValidation,
    updateAdminValidation
};