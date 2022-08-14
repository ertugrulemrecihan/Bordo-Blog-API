const mongoose = require('mongoose');

const PaymentSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        payment_date: {
            type: Date,
            default: Date.now,
        },
        total_price: {
            type: mongoose.Types.Decimal128,
            required: true,
        },
    },
    { versionKey: false }
);

module.exports = mongoose.model('payment', PaymentSchema);
