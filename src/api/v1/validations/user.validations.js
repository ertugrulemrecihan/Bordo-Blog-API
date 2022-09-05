const Joi = require('joi');

const loginValidation = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string()
        .required()
        .min(8)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()+?])(?=.{8,})/
        ),
});

const registerValidation = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string()
        .required()
        .min(8)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()+?])(?=.{8,})/
        ),
    first_name: Joi.string().required().min(3).max(100),
    last_name: Joi.string().required().min(3).max(100),
});

const createChangeEmailTokenValidation = Joi.object({
    new_email: Joi.string().required().email(),
});

const createPasswordResetTokenValidation = Joi.object({
    email: Joi.string().required().email(),
});

const createEmailVerificationTokenValidation = Joi.object({
    email: Joi.string().required().email(),
});

const resetPasswordValidation = Joi.object({
    token: Joi.string().required().min(6),
    new_password: Joi.string()
        .required()
        .min(8)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()+?])(?=.{8,})/
        ),
});

const changePasswordValidation = Joi.object({
    // Old_password must not equal new_password
    old_password: Joi.string()
        .required()
        .min(8)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()+?])(?=.{8,})/
        ),
    new_password: Joi.string()
        .required()
        .min(8)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()+?])(?=.{8,})/
        )
        .invalid(Joi.ref('old_password')),
});

module.exports = {
    loginValidation,
    registerValidation,
    createPasswordResetTokenValidation,
    resetPasswordValidation,
    changePasswordValidation,
    createEmailVerificationTokenValidation,
    createChangeEmailTokenValidation,
};
