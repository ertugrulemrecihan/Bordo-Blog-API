const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true,
    },
    payment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'payment',
        require: true,
    },
    plan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'plan',
        require: true,
    },
});

module.exports = mongoose.model('order', OrderSchema);
