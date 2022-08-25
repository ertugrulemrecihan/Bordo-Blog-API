const connectDb = require('./dbConnection');
const dbSeeder = require('./dbSeeder');
const connectRedis = require('./redis');

module.exports = () => {
    connectDb();
    dbSeeder();
    connectRedis();
};
