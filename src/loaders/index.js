const connectDb = require('../loaders/dbConnection');
const dbSeeder = require('../loaders/dbSeeder');

module.exports = () => {
    connectDb();
    dbSeeder();
};
