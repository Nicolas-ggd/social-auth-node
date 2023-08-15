const User = require('../models/User');
const OneTimeCode = require('../models/OneTimeCode');
const { sendVerificationSMSCode, randomHaxNumber } = require('../utils/verificationHelper');

const verify = async (req, res) => {
    const { verificationCode } = req.body;

    const oneTimeSMS = await OneTimeCode.findOne({ code: verificationCode });

    if (!oneTimeSMS) {
        return res.status(400).json({ message: "User verified failed" });
    }

    try {
        const user = await User.findOne({ OneTimeCode: oneTimeSMS._id });

        if (user) {
            user.verified = true;

            await user.save();
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed user verification" });
    }
};

const resendVerificationCode = async (req, res) => {
    const { mobileNumber } = req.body;

    try {
        let userVerified = await User.findOne({ mobileNumber });

        if (userVerified) {

            if (userVerified.verified) {
                return res.status(400).json({ status: true, message: "User is already verified." });
            }

            let verificationCode = randomHaxNumber();
            let isEmailSend = sendVerificationSMSCode(mobileNumber, verificationCode);

            if (isEmailSend) {
                return res.status(200).json({ status: true, message: "Code is sended in number" });
            } else {
                return res.status(400).json({ status: false, message: "Code isn't sended in number" });
            }

        } else {
            return res.status(400).json({ status: false, message: "Mobile number does't exist" });
        }

    } catch (error) {
        console.log(error)
    }
};

module.exports = {
    verify,
    resendVerificationCode
};