const mongoose = require('mongoose');

const OneTimeCode = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300
        }
    }
);

module.exports = mongoose.model('OneTimeCode', OneTimeCode);