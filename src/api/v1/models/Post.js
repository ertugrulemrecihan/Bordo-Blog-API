const mongoose = require('mongoose');

const PostSchema = mongoose.Schema(
    {
        writer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: 'true',
        },
        title: {
            type: String,
            min: 10,
            max: 200,
            required: true,
        },
        description: {
            type: String,
            min: 10,
            max: 375,
            required: true,
        },
        slug: {
            type: String,
            min: 10,
            max: 300,
            required: true,
            unique: true,
        },
        cover_image: {
            file_id: {
                type: String,
                default: '-1',
            },
            url: {
                type: String,
                default: null,
            },
            name: {
                type: String,
                default: null,
            },
        },
        content: {
            type: String,
            min: 120,
            required: true,
        },
        viewers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: true,
            },
        ],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: true,
            },
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'comment',
                required: true,
            },
        ],
        tags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'tag',
                required: true,
            },
        ],
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('post', PostSchema);
