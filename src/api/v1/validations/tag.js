const Joi = require("joi");

const createValidations = Joi.object({
    name: Joi.string().required().min(3).max(50),
    post_count: Joi.number().default(0)
})

module.exports = {
    createValidations,
}