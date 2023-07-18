const mongoose = require('mongoose');

const ResetPasswordHash = new mongoose.Schema(
    {
        hash: String,
    }
);

module.exports = mongoose.model('ResetPasswordHash', ResetPasswordHash);