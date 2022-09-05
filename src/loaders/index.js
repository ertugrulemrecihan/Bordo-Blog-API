const connectDb = require('./db-connection.loader');
const dbSeeder = require('./db-seeder.loader');
const connectRedis = require('./redis.loader');

module.exports = () => {
    connectDb();
    dbSeeder();
    connectRedis();
};
