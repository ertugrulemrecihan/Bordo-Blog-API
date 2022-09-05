const mongoose = require('mongoose');

const CitySchema = mongoose.Schema(
    {
        country: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'country',
            required: true,
        },
        zip_code: {
            type: String,
            required: true,
            min: 5,
            max: 5,
        },
        name: {
            type: String,
            min: 3,
            max: 30,
            required: true,
        },
        region: {
            type: String,
            min: 3,
            max: 60,
            required: true,
        },
    },
    { versionKey: false }
);

module.exports = mongoose.model('city', CitySchema);
