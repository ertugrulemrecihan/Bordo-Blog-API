const mongoose = require('mongoose');

const EmailVerificationTokenSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 60 * 60,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model(
    'email_verification_token',
    EmailVerificationTokenSchema
);
