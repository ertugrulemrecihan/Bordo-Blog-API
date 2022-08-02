const connectDb = require("../loaders/dbConnection");

module.exports = () => {
    connectDb();
};
