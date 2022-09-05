const mongoose = require('mongoose');

const PlanSchema = mongoose.Schema(
    {
        name: {
            type: String,
            min: 3,
            max: 150,
            required: true,
        },
        description: {
            type: String,
            min: 3,
            max: 350,
            required: true,
        },
        purchases_count: {
            type: Number,
            min: 0,
            default: 0,
        },
        price: {
            type: Number,
            min: 0,
            required: true,
        },
        right_to_view: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('plan', PlanSchema);
