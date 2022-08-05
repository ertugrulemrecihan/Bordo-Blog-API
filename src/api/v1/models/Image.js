const mongoose = require('mongoose');

const ImageSchema = mongoose.Schema({
    path: {
        type: String,
        min: 10,
        required: true,
    },
});

module.exports = mongoose.model('image', ImageSchema);
