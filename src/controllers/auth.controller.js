const User = require('../models/User');
const generateToken = require('../configs/generateToken');

const userAuth = async (req, res) => {
    const { mobileNumber, password } = req.body;

    try {
        if (!mobileNumber || !password) {
            return res.status(400).json({ message: "Mobile number and password are required" });
        }

        const authUser = await User.findOne({ mobileNumber });

        if (!authUser) return res.status(401).json({ message: "Unauthorized" });

        if (authUser && (authUser.matchPassword(password))) {
            const access_token = generateToken(
                {
                    UserInfo: {
                        _id: authUser._id,
                    },
                },
                "access_token",
                "30d"
            );

            const refresh_token = generateToken(
                {
                    UserInfo: {
                        _id: authUser._id,
                    },
                },
                "refresh_token",
                "30d"
            );

            await User.updateOne(
                { mobileNumber: authUser.mobileNumber },
                {
                    $set: {
                        refresh_token: refresh_token,
                        online: true
                    }
                }
            );

            res.cookie("jwt", refresh_token, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 24 * 60 * 60 * 1000,
            });

            res.json({
                _id: authUser._id,
                access_token: access_token,
                name: authUser.name,
                mobileNumber: authUser.mobileNumber,
            });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(error)
    }
};

module.exports = {
    userAuth
}