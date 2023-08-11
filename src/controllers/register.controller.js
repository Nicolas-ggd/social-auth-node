const User = require('../models/User');
const verificationHelper = require('../utils/verificationHelper');

const userRegister = async (req, res) => {
    const { name, mobileNumber, password } = req.body;

    try {
        const existedUser = await User.findOne({ mobileNumber });

        if (existedUser) {
            res.status(400).json({
                message: "Player already exists!"
            });
        }

        const verificationCode = await verificationHelper.generateVerificationCode();

        const userCreate = await User.create({
            name,
            mobileNumber,
            password,
            verificationCode
        });

        if (userCreate) {
            if (mobileNumber.includes('@gmail.com')) {
                await verificationHelper.sendVerificationCode(
                    mobileNumber,
                    verificationCode
                );
            } else {
                await verificationHelper.sendVerificationSMSCode(
                    mobileNumber,
                    verificationCode
                )
            }
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