const User = require('../models/User');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const generateVerificationCode = async () => {
    const min = 100000;
    const max = 999999;
    let code = Math.floor(Math.random() * (max - min + 1)) + min;
    let isCodeExists = await User.findOne({ verificationCode: code });

    if (isCodeExists) {
        return generateVerificationCode();
    }

    return code;
};

const isEmailVerified = async (mobileNumber) => {
    let userVerified = await User.findOne({ mobileNumber });

    if (userVerified && userVerified.verified) {
        return true
    } else {
        return false
    }
};

const resendVerificationCode = async (req, res) => {
    const { mobileNumber } = req.body;
    console.log(mobileNumber, ' mobileNumber')
    try {
        let userVerified = await User.findOne({ mobileNumber });

        if (userVerified) {

            if (userVerified.verified) {
                return res.status(400).json({ status: true, message: "User is already verified." });
            }

            let verificationCode = userVerified.verificationCode;
            let isEmailSend = await sendVerificationSMSCode(mobileNumber, verificationCode);

            if (isEmailSend) {
                return res.status(200).json({ status: true, message: "Code is sended in mobile number" });
            } else {
                return res.status(400).json({ status: false, message: "Code isn't sended in mobile number" });
            }

        } else {
            return res.status(400).json({ status: false, message: "Email does't exist" });
        }

    } catch (error) {
        console.log(error)
    }
};

const sendVerificationSMSCode = async (mobile, verificationCode) => {
    client.messages
    .create({
       body: `Your verification Kotoamatsukami code ${verificationCode}`,
       from: "+14066254463",
       to: `+995${mobile}`
     })
    .then(message => console.log(message, 'message'))
    .catch((err) => console.log(err))
};

const verify = async (verificationCode) => {
    
    try {
        await User.findOneAndUpdate(
            { verificationCode },
            { verified: true }
        );
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    generateVerificationCode,
    isEmailVerified,
    resendVerificationCode,
    verify,
    sendVerificationSMSCode
};