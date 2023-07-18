const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const GenerateToken = (userInfo, type, time) => {
    return jwt.sign(
        userInfo,
        type === 'access_token' ? process.env.ACCESS_WEB_TOKEN_SECRET : process.env.REFRESH_WEB_TOKEN_SECRET,
        { expiresIn: time }
    );
};

module.exports = GenerateToken;