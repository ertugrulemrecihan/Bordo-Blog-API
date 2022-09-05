const mongoose = require('mongoose');

const DistrictSchema = mongoose.Schema(
    {
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'city',
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
            max: 80,
            required: true,
        },
    },
    { versionKey: false }
);

module.exports = mongoose.model('district', DistrictSchema);
