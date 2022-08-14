const mongoose = require('mongoose');

const AddressSchema = mongoose.Schema(
    {
        city_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'city',
            required: true,
        },
        country_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'country',
            required: true,
        },
        district_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'district',
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        address_1: {
            type: String,
            required: true,
            min: 10,
            max: 200,
        },
        address_2: {
            type: String,
            min: 10,
            max: 200,
        },
    },
    { versionKey: false }
);

module.exports = mongoose.model('address', AddressSchema);
