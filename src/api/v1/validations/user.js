const Joi = require("joi");

const loginValidation = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()+?])(?=.{8,})/),
});

const registerValidation = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()+?])(?=.{8,})/),
    first_name: Joi.string().required().min(3).max(100),
    last_name: Joi.string().required().min(3).max(100),
    phone: Joi.object({
        area_code: Joi.string().required().min(1).max(4),
        number: Joi.string().required().min(10).max(10),
    }),
});

const createPasswordResetTokenValidation = Joi.object({
    email: Joi.string().required().email(),
});

const passwordResetValidation = Joi.object({
    token: Joi.string().required().min(6),
    new_password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()+?])(?=.{8,})/),
});

const changePasswordValidation = Joi.object({
    // old_password must not equal new_password
    old_password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()+?])(?=.{8,})/),
    new_password: Joi.string().required().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()+?])(?=.{8,})/).invalid(Joi.ref('oldPassword')),
});

module.exports = {
    loginValidation,
    registerValidation,
    createPasswordResetTokenValidation,
    passwordResetValidation,
    changePasswordValidation,
};
