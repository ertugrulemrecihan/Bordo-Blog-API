const mongoose = require("mongoose");

const AccountSchema = mongoose.Schema(
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
        username: {
            type: String,
            min: 3,
            max: 100,
            required: true,
            unique: true,
        },
        phone: {
            area_code: {
                type: String,
                min: 1,
                max: 4,
                required: true,
            },
            number: {
                type: String,
                min: 10,
                max: 10,
                required: true,
            },
            required: false,
            unique: true,
        },
        phone_number_is_verified: {
            type: Boolean,
            default: false,
        },
        email: {
            type: String,
            required: false,
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
                type: mongoose.Schema.Types.ObjectId,
                ref: "role",
                required: true,
            },
        ],
        package: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "package",
                required: true,
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("account", AccountSchema);
