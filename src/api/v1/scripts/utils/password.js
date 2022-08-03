const CryptoJs = require('crypto-js');
const bcrypt = require('bcrypt');

const passwordToHash = (plainPassword) => {
    // Generate a salt
    const randomSalt = bcrypt.genSaltSync(10);

    // Hash the salt
    const hashedSalt = CryptoJs.HmacSHA256(randomSalt, process.env.SALT_HASH).toString();

    //  Hash the password with the salt
    const hashedPassword = passwordToHashWithSalt(plainPassword, hashedSalt);
    return {
        hashedPassword,
        hashedSalt
    };
};

const passwordToHashWithSalt = (plainPassword, salt) => {
    return CryptoJs.HmacSHA256((plainPassword + salt), process.env.PASSWORD_HASH).toString();
};

module.exports = {
    passwordToHash,
    passwordToHashWithSalt,
};