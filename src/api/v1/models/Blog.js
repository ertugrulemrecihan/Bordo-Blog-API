const mongoose = require("mongoose");

const BlogSchema = mongoose.Schema({
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
    content: {
        type: String,
        min: 120,
        required: true,
    },
    images: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "image",
            required: true,
        },
    ],
    viewers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "account",
            required: true,
        },
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "account",
            required: true,
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment",
            required: true,
        },
    ],
    tags: [
        {
            type: String,
            required: true,
        },
    ],
});

module.exports = mongoose.model("blog", BlogSchema);
