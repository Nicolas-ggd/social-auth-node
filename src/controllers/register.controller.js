const User = require('../models/User');
const verificationHelper = require('../utils/verificationHelper');

const userRegister = async (req, res) => {
    const { name, numberOrEmail, password } = req.body;

    try {
        const existedUser = await User.findOne({ numberOrEmail });

        if (existedUser) {
            res.status(400).json({
                message: "Player already exists!"
            });
        }

        const verificationCode = await verificationHelper.generateVerificationCode();

        const userCreate = await User.create({
            name,
            numberOrEmail,
            password,
            verificationCode
        });

        if (userCreate) {
            if (numberOrEmail.includes('@gmail.com')) {
                await verificationHelper.sendVerificationCode(
                    numberOrEmail,
                    verificationCode
                );
            } else {
                await verificationHelper.sendVerificationSMSCode(
                    numberOrEmail,
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