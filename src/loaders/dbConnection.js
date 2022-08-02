const mongoose = require("mongoose");

const connectDb = async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected Db");
};

module.exports = connectDb;
