const jwtHelper = require('./jwt');

const createResponse = (user) => {
    const userObject = deletePasswordAndSaltFields(user);

    return {
        ...userObject,
        tokens: {
            access: jwtHelper.generateAccessToken(userObject),
            refresh: jwtHelper.generateRefreshToken(userObject),
        }
    };
};

const deletePasswordAndSaltFields = (user) => {
    const newObject = user.toObject();

    delete newObject.password;
    delete newObject.salt;

    return newObject;
};

module.exports = {
    createResponse,
    deletePasswordAndSaltFields,
};