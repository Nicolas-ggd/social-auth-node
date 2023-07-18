const notFound = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404).json({ "message": "Not found" });
    next(error);
};

const errorHandler = (err, req, res, next) => {
    res.status(500).json({ "message": "Internal server error" });
};

module.exports = {
    notFound,
    errorHandler
};