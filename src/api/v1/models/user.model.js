const Mongoose = require('mongoose');

const UserSchema = Mongoose.Schema(
    {
        first_name: {
            type: String,
            min: 3,
            max: 100,
            required: true,
        },
        last_name: {
            type: String,
            min: 3,
            max: 100,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        avatar: {
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
        last_login: {
            type: Date,
            required: true,
        },
        email_verified: {
            type: Boolean,
            default: false,
        },
        email_notification: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            min: 8,
            required: true,
            select: false,
        },
        salt: {
            type: String,
            required: true,
            select: false,
        },
        roles: [
            {
                type: Mongoose.Schema.Types.ObjectId,
                ref: 'role',
                required: true,
            },
        ],
        plan: {
            type: Mongoose.Schema.Types.ObjectId,
            ref: 'plan',
            default: null,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = Mongoose.model('user', UserSchema);
