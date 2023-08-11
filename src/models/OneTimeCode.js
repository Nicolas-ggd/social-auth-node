const mongoose = require('mongoose');

const OneTimeCode = new mongoose.Schema(
    {
        code: String
    }
);

module.exports = mongoose.model('OneTimeCode', OneTimeCode);