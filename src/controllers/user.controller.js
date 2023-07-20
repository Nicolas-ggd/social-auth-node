const User = require('../models/User');

const findUser = async (req, res) => {
    const { email } = req.query;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.verified = true;
        await user.save();

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "User not found" });
    }
};


module.exports = {
    findUser
}