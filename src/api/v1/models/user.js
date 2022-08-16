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
            type: String,
            default: '/uploads/avatars/default-avatar.jpg',
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
        },
        salt: {
            type: String,
            required: true,
        },
        roles: [
            {
                type: Mongoose.Schema.Types.ObjectId,
                ref: 'role',
                required: true,
            },
        ],
        packages: [
            {
                type: Mongoose.Schema.Types.ObjectId,
                ref: 'package',
                required: true,
            },
        ],
    },
    { timestamps: true, versionKey: false }
);

module.exports = Mongoose.model('user', UserSchema);
