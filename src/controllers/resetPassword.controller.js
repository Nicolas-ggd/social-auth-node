const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../configs/generateToken');
const ResetPassword = require('../models/ResetPasswordHash');
const verificationHelper = require('../utils/verificationHelper');

const randomHaxString = () => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const resetUserPassword = async (req, res) => {
    const { mobileNumber } = req.body;
    
    try {
        if (!mobileNumber) {
            return res.status(400).json({ message: "Mobile number is requried to reset password" });
        }
        
        const authUser = await User.findOne({ mobileNumber });

        if (!authUser) {
            return res.status(400).json({ message: "Wrong mobile number, it doesn't exist in database" });
        }

        const randomToken = randomHaxString(6)

        const hexToken = await ResetPassword.create({ hash: randomToken });

        await User.updateOne(
            { mobileNumber: authUser.mobileNumber },
            {
                $set: {
                    ResetPasswordHash: hexToken._id.toString()
                }
            }
        );

        const dark = verificationHelper.sendVerificationSMSCode(numberOrEmail, randomToken);
            console.log(dark, 'mamed dzmas')
        return res.status(200).json({ message: "Reset link sent to your mobile number" });

    } catch (error) {
        return res.status(400).json(error);
    }
};

const findUserWithToken = async (req, res) => {
    const { token, password, confirmPassword } = req.body;

    try {
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password and confirm password don't match!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const resetPasswordHash = await ResetPassword.findOne({ hash: token });

        if (!resetPasswordHash) {
            return res.status(404).json({ message: "User not found!" });
        }

        const filter = resetPasswordHash._id.toString()
        const user = await User.findOne({ ResetPasswordHash: filter })

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        user.password = hashedPassword;
        await user.save();

        const access_token = generateToken(
            {
                UserInfo: {
                    _id: user._id.toString(),
                },
            },
            "access_token",
            "30d"
        );

        const refresh_token = generateToken(
            {
                UserInfo: {
                    _id: user._id.toString(),
                },
            },
            "refresh_token",
            "30d"
        );

        await User.updateOne(
            { ResetPasswordHash: filter },
            {
                $set: {
                    password: hashedPassword,
                    refresh_token: refresh_token,
                },
            }
        );

        res.cookie("jwt", refresh_token, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.json({
            _id: user._id,
            access_token: access_token,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
};

module.exports = {
    resetUserPassword,
    findUserWithToken
}