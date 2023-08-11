const User = require('../models/User');
const { sendVerificationSMSCode, randomHaxNumber } = require('../utils/verificationHelper');

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