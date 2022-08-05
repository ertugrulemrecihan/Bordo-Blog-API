const mongoose = require('mongoose');

const PackageSchema = mongoose.Schema(
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
        person_count: {
            type: String,
            min: 3,
            max: 100,
            required: true,
        },
        month_price: {
            type: String,
            min: 3,
            max: 100,
            required: true,
        },
        year_price: {
            type: String,
            min: 3,
            max: 100,
            required: true,
        },
    }, {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('package', PackageSchema);
