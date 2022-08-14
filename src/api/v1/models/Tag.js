const mongoose = require('mongoose');

const TagSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            min: 3,
            max: 50,
        },
        post_count: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('tag', TagSchema);
