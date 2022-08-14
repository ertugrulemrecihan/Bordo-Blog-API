const Mongoose = require('mongoose');
const db = Mongoose.connection;

db.once('open', () => {
    console.log('Connected to MongoDB');
});

db.once('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

const connectDb = async () => {
    await Mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
    });
};

module.exports = connectDb;
