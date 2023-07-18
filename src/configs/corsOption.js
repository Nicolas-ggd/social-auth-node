const AllowOrigins = require('./allowOrigins');

const CorsOption = {
    origin: (origin, callback) => {
        if (AllowOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = CorsOption;