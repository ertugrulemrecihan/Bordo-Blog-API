const mongoose = require('mongoose');

const CountrySchema = mongoose.Schema(
    {
        name: {
            type: String,
            min: 3,
            max: 80,
            required: true,
        },
    },
    { versionKey: false }
);

module.exports = mongoose.model('country', CountrySchema);
