const User = require('../models/User');
const generateToken = require('../configs/generateToken');
const verificationHelper = require('../utils/verificationHelper');

const userAuth = async (req, res) => {
    const { email, password, verificationCode } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const authUser = await User.findOne({ email });

        await verificationHelper.verify(verificationCode);
        
        if (!authUser.verified) {
            return res.status(401).json({ message: "Your account is not verified, please check your email and verify account." });
        }

        if (!authUser) return res.status(401).json({ message: "Unauthorized" });

        if (authUser && (await authUser.matchPassword(password))) {
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
                { email: authUser.email },
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
                email: authUser.email,
            });
        }
    } catch (error) {
        return res.status(500).json(error)
    }
};

module.exports = {
    userAuth
}