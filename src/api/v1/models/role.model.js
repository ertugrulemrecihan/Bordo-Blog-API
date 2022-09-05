const mongoose = require('mongoose');

const RoleSchema = mongoose.Schema(
    {
        name: {
            type: String,
            min: 3,
            max: 50,
            required: true,
        },
        description: {
            type: String,
            min: 3,
            max: 150,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('role', RoleSchema);
