const bcrypt = require('bcrypt');
const nodeMailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../configs/generateToken');
const ResetPassword = require('../models/ResetPasswordHash');

const randomHaxString = (length) => {
    return crypto
        .randomBytes(length)
        .toString('hex')
        .slice(0, length)
};

const resetUserPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: "Email is requried to reset password" });
        }

        const authUser = await User.findOne({ email });

        const randomToken = randomHaxString(8)

        const hexToken = await ResetPassword.create({ hash: randomToken });

        await User.updateOne(
            { email: authUser.email },
            {
                $set: {
                    ResetPasswordHash: hexToken._id.toString()
                }
            }
        );

        const resetLink = `http://localhost:5173/reset-password?token=${randomToken}`

        const nodeTransporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASS
            }
        });

        const mailOptions = {
            from: 'Nicolas@example.com',
            to: 'ggdnicolas@gmail.com',
            subject: 'Subject',
            html: resetPasswordTemplate(resetLink)
        };

        nodeTransporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            } else {
                console.log(`Email sent: ${info.response}`)
            }
        });

        return res.status(200).json({ message: "Reset link sent to your email" })

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

const resetPasswordTemplate = (reset_link) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verification</title>
      </head>
      <body>
        <table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color: #fff; border-collapse: collapse;">
          <tr>
            <td style="padding: 20px;">
              <h1 style="text-align:center;">Welcome to ${process.env.COMPANY_NAME}</h1>
              <p>Thanks for updating profile.</p>
              <table align="center" style="margin: 20px auto;">
                <tr>
                  <td>
                    <a href="${reset_link}" style="background-color: #49d2d2; color: white; padding: 12px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 18px; text-decoration: none;">
                      Reset password
                    </a>
                  </td>
                </tr>
              </table>
              <p>If you have any issues or didn't sign up for an account, please contact us at <a href="mailto:${process.env.COMPANY_EMAIL}">${process.env.COMPANY_EMAIL}</a></p>
            </td>
          </tr>
        </table>
      </body>
      </html>  
      `;
}

module.exports = {
    resetUserPassword,
    findUserWithToken
}