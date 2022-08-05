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
        phone: {
            area_code: {
                type: String,
                min: 1,
                max: 4,
                required: false,
            },
            number: {
                type: String,
                min: 10,
                max: 10,
                required: false,
            },
            required: false,
        },
        phone_number_is_verified: {
            type: Boolean,
            default: false,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        email_is_verified: {
            type: Boolean,
            default: false,
        },
        isRegistiredEmailNotif: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            min: 10,
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
        package: [
            {
                type: Mongoose.Schema.Types.ObjectId,
                ref: 'package',
                required: true,
            },
        ],
    }, {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = Mongoose.model('user', UserSchema);
