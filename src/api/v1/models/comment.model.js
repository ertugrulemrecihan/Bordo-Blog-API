const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        comment: {
            type: String,
            required: true,
            min: 10,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('comment', CommentSchema);
