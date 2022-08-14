const JWT = require('jsonwebtoken');

const generateAccessToken = (data) => {
    return JWT.sign({ data }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXP,
    });
};

const generateRefreshToken = (data) => {
    return JWT.sign({ data }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXP,
    });
};

const generatePasswordResetToken = (data) => {
    return JWT.sign({ data }, process.env.JWT_PASSWORD_RESET_SECRET, {
        expiresIn: process.env.JWT_PASSWORD_RESET_EXP * 60,
    });
};

const decodePasswordResetToken = (token) => {
    return JWT.verify(token, process.env.JWT_PASSWORD_RESET_SECRET);
};

const generateEmailVerifyToken = (data) => {
    return JWT.sign({ data }, process.env.JWT_EMAIL_VERIFY_SECRET, {
        expiresIn: process.env.JWT_EMAIL_VERIFY_EXP * 60,
    });
};

const decodeEmailVerifyToken = (token) => {
    return JWT.verify(token, process.env.JWT_EMAIL_VERIFY_SECRET);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generatePasswordResetToken,
    decodePasswordResetToken,
    generateEmailVerifyToken,
    decodeEmailVerifyToken,
};
