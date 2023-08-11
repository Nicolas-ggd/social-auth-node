const User = require('../models/User');

const verify = async (req, res) => {
    const verificationCode = req.body;

    try {
        await User.findOneAndUpdate(
            { verificationCode },
            { verified: true }
        );

        res.status(200).json({ message: "User verified successfuly" });
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    verify
};