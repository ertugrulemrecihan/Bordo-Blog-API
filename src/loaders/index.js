const connectDb = require('./dbConnection');
const dbSeeder = require('./dbSeeder');
const folderBuilder = require('./folderBuilder');

module.exports = () => {
    folderBuilder();
    connectDb();
    dbSeeder();
};
