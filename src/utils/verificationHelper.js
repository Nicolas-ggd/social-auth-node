const nodeMailer = require('nodemailer');
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
    console.log(req)
    console.log(mobileNumber, ' mobileNumber')
    try {
        let userVerified = await User.findOne({ mobileNumber });

        if (userVerified) {

            if (userVerified.verified) {
                return res.status(400).json({ status: true, message: "User is already verified." });
            }

            let verificationCode = userVerified.verificationCode;
            let isEmailSend = await sendVerificationCode(mobileNumber, verificationCode);

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

const sendVerificationCode = async (email, verificationCode) => {
    const emailTransporter = nodeMailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASS
        }
    });

    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: email,
        subject: "Verification email",
        html: verificationTemplate(
            process.env.FRONTEND_URL + "/verify?verifyCode=" + verificationCode
        )
    }

    let response;

    await emailTransporter.sendMail(mailOptions).catch(() => {
        response = false;
    })
    response = true;

    return response;
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

const verificationTemplate = (verification_link) => {
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
              <p>Thanks for updating profile. please verify your email address by clicking the button below:</p>
              <table align="center" style="margin: 20px auto;">
                <tr>
                  <td>
                    <a href="${verification_link}" style="background-color: #49d2d2; color: white; padding: 12px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 18px; text-decoration: none;">
                      Verify my email
                    </a>
                  </td>
                </tr>
              </table>
              <p>If you have any issues or didn't sign up for an account, please contact us at <a href="mailto:${process.env.COMPANY_EMAIL}">${process.env.COMPANY_EMAIL}</a></p>
              <p><b>If you haven't signup with us, please disregard this email and do not click on the verify button. We apologize for any inconvenience this may have caused.</b></p>
            </td>
          </tr>
        </table>
      </body>
      </html>  
      `;
}

module.exports = {
    generateVerificationCode,
    sendVerificationCode,
    isEmailVerified,
    resendVerificationCode,
    verify,
    sendVerificationSMSCode
};