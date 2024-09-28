// import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import MAIL_TEMPLATE from "../templates/mail.template.js";

const trustedDomains = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "protonmail.com",
  "aol.com",
  "zoho.com",
  "mail.com",
  "yandex.com",
  "gmx.com",
  "fastmail.com",
  "tutanota.com",
  "comcast.net",
  "verizon.net",
];

function isTrustedEmail(email) {
  const domain = email.split("@")[1];
  return trustedDomains.includes(domain);
}

function generateAlphanumericOTP(length) {
  const otp = crypto.randomBytes(length).toString("hex").slice(0, length);
  return otp;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_ID,
    pass: process.env.SMTP_PASSWORD,
  },
});

// const SENDMAIL = async (email, otp, callback) => {
//   const mailDetails = {
//     from: process.env.SMTP_ID, // sender addresser
//     to: email, // receiver email
//     subject: "Email Verification! ", // Subject line
//     text: `Your Verification OTP Is: ${otp}`,
//     html: MAIL_TEMPLATE(otp),
//   };

//   try {
//     const info = await transporter.sendMail(mailDetails);
//     callback(info);
//   } catch (error) {
//     console.error("Error occurred while sending email:", error);

//     if (error.response) {
//       console.error("SMTP Response:", error.response);
//     }
//     //callback(error);
//   }

const SENDMAIL = async (email, otp) => {
  const mailDetails = {
    from: process.env.SMTP_ID, // sender addresser
    to: email, // receiver email
    subject: "Email Verification! ", // Subject line
    text: `Your Verification OTP Is: ${otp}`,
    html: MAIL_TEMPLATE(otp),
  };

  try {
    const info = await transporter.sendMail(mailDetails);
    return info;
  } catch (error) {
    console.error("Error occurred while sending email:", error);
    error.success = false;
    return error;
  }
};

/*Legacy Code Used For Generating & Verifying JWT Token Which Was Sent To User's Email In The Form Of Verification Link

  function createToken(email) {
    //const randomString = crypto.randomBytes(32).toString("hex");
    try {
      if (!email) throw new Error("Email is Empty!");
      const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1m",
      }); // Token expires in 1 hour
      return token;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function isValidToken(token) {
    try {
      const decoded = jwt.decode(token);
      console.log("Decoded Token: ", decoded);
      return decoded;
    } catch (error) {
      console.error("Error while decoding token: ", error);
      return null;
    }
  }

*/

// verify connection configuration
async function verifySMTPConnection() {
  try {
    const result = await transporter.verify();
    if (result) {
      console.log("SMTP Server is ready to take our messages: ", result);
    }
  } catch (error) {
    console.error("SMTP Connection failed: ", error);
  }
}

export {
  verifySMTPConnection,
  isTrustedEmail,
  generateAlphanumericOTP,
  SENDMAIL,
};
