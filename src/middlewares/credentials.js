const AllowOrigins = require('../configs/allowOrigins');

const credentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (AllowOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Credentials', true);
    }
    next();
}

module.exports = credentials;