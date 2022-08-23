const connectDb = require('./dbConnection');
const dbSeeder = require('./dbSeeder');

module.exports = () => {
    connectDb();
    dbSeeder();
};
