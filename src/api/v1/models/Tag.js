const mongoose = require("mongoose");

const TagSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    post_count: {
        type: Number,
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('tag', TagSchema);