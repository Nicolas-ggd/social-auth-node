const User = require('../models/User');
const OneTimeCode = require('../models/OneTimeCode');
const verificationHelper = require('../utils/verificationHelper');

const userRegister = async (req, res) => {
    const { name, mobileNumber, password } = req.body;

    try {
        const existedUser = await User.findOne({ mobileNumber });

        if (existedUser) {
            return res.status(400).json({
                message: "Player already exists!"
            });
        }

        const verificationCode = await verificationHelper.generateVerificationCode();

        const oneTimeSMSCode = await OneTimeCode.create({ code: verificationCode });
        
        const userCreate = await User.create({
            name,
            mobileNumber,
            password,
            verificationCode,
            oneTimeSMSCode
        });

        if (userCreate) {

            await User.updateOne(
                { _id: userCreate._id },
                {
                    $set: {
                        OneTimeCode: oneTimeSMSCode._id.toString()
                    }
                }
            )

            await verificationHelper.sendVerificationSMSCode(
                mobileNumber,
                verificationCode
            )

        }

        return res.status(200).json(userCreate);
    } catch (error) {
        console.log(error);
        return res.status(400).json(error);
    }
};

module.exports = {
    userRegister
}