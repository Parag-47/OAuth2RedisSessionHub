import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import {
  isTrustedEmail,
  generateAlphanumericOTP,
  SENDMAIL,
} from "../services/mail.services.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  GOOGLE_AUTH_URI,
  getGoogleOAuthTokens,
  getGoogleUser,
} from "../services/googleOauth.services.js";

async function googleAuth(req, res) {
  try {
    res.redirect(GOOGLE_AUTH_URI);
  } catch (error) {
    console.log("Error In Redirect: ", error);
    res.redirect(`/oauth/Failed To Authenticate!`);
  }
}

async function googleAuthCallback(req, res) {
  try {
    const { error, code } = req.query;
    if (error) {
      console.log("Error In Callback: ", error);
      return res.redirect(`/oauth/Failed To Authenticate!`);
    }

    const tokens = await getGoogleOAuthTokens(code);

    if (!tokens) throw new ApiError(500, "Empty Tokens Received!");

    const googleUser = await getGoogleUser(tokens);
    //console.log(googleUser);
    if (!googleUser) throw new ApiError(500, "Google Profile Not Received!");

    const existingUser = await User.findOne({ email: googleUser.email });

    if (existingUser) {
      req.session.userId = existingUser._id;
      return res.redirect(`/?profilePic=${googleUser.picture}`);
      //return res.redirect("/");
    }

    // Create new user
    const newUser = await User.create({
      email: googleUser.email,
      name: googleUser.name,
      verified_email: googleUser.verified_email,
    });

    if (!newUser) throw new ApiError(500, "Failed To Create User!");

    req.session.userId = newUser._id;
    res.redirect(`/?profilePic=${googleUser.picture}`);
  } catch (error) {
    console.log("Error In Callback: ", error);
    res.redirect(`/oauth/Failed To Authenticate!`);
  }
}

const signup = asyncHandler(async (req, res) => {
  if (req.session.userId) return res.redirect("/");

  let { phone, email } = req.body;

  if (!(phone || email) )
    throw new ApiError(400, "All fields are required!");

  if (email) email = email.toLowerCase();

  const existedUser = await User.findOne({
    $or: [
      { phone: { $exists: true, $eq: phone } },
      { email: { $exists: true, $eq: email } },
    ],
  });
  // Check if password felid is present and resend otp 
  if (existedUser) {
    if (
      existedUser.verified_email === true ||
      existedUser.verified_phone === true
    )
      throw new ApiError(
        400,
        "This Email Or Phone Number Is Already Registered!"
      );
    throw new ApiError(
      400,
      `Your Account Has Already Been Created But Is Not Verified Please Check Your Phone/Email For Verification Link, To Resend Verification Link Go To ${"http://"}`
    );
  }

  if (!isTrustedEmail(email))
    throw new ApiError(
      400,
      `We Only Accept Email Account From These Providers: ${trustedDomains}`
    );

  const otp = generateAlphanumericOTP(6);

  // const saveOTP = await storeOTP(email, otp);

  // if (saveOTP !== "OK") throw new ApiError(500, "Failed To Generate OTP!");

  const info = await SENDMAIL(email, otp);

  if (info.success === false)
    throw new ApiError(500, "Failed to send email!", info);

  req.session.cookie.maxAge = 1000 * 60 * 2; // 2 min
  req.session.otpData = {email, otp};

  res
    .status(200)
    .json(new ApiResponse(200, true, "Verification Mail Sent Successfully!"));
});

const resendVerificationCode = asyncHandler(async (req, res) => {

});

const verifyOTP = asyncHandler(async (req, res) => {
  if(!req.session.otpData) throw new ApiError(401, "Email Verification Required Or Session Is Expired!");
  
  const email = req.session.otpData.email;
  let { otp } = req.body;
  otp = otp.trim();

  const existedUser = await User.findOne({
    email: { $exists: true, $eq: email }
  });

  if (existedUser)
    throw new ApiError(
      400,
      "This Email Or Phone Number Is Already Registered!"
    );

  if(otp !== req.session.otpData.otp) throw new ApiError(500, "Invalid OTP!");

  const verifyUserEmail = await User.create({
    email: email,
    verified_email: true,
  });

  if (!verifyUserEmail) throw new ApiError(500, "Failed To Verify Email!");

  res
    .status(200)
    .json(new ApiResponse(200, true, "Email Verified Successfully!"));
});

const setPassword = asyncHandler(async (req, res) => {
  if(!req.session.OTP) throw new ApiError(401, "Email Verification Required Or Session Is Expired!");
  
  const { email } = req.session.OTP;
  const { password } = req.body;

  const user = await User.findOne({email: email});
  if(user.password) throw new ApiError(400, "Password Is Already Set!");  
  
  const hashedPassword = await bcrypt.hash(password.trim(), 10);

  const set_password = await User.findByIdAndUpdate(user._id, { $set: { password: hashedPassword } });

  if (!set_password) throw new ApiError(500, "Failed To Set Password!");

  res.status(200).json(new ApiResponse(200, true, "Password Saved Successfully!"));
});

const login = asyncHandler(async (req, res) => {
  if (req.session.userId) return res.redirect("/home");

  let { phone, email, password } = req.body;

  if (!(phone || email) || !password)
    throw new ApiError(400, "Email Id/Phone Number And Password Is Required!");

  if (email) email = email.toLowerCase();

  const user = await User.findOne({
    $or: [
      { phone: { $exists: true, $eq: phone } },
      { email: { $exists: true, $eq: email } },
    ],
  });

  if (!user) throw new ApiError(404, "User doesn't exist!");
  // console.log("User: ", user);

  if (!user.verified_email === true || !user.verified_phone === true)
    throw new ApiError(
      401,
      "Your Account Is Not Verified Please Verify Your Account!"
    );

  if (!user.password)
    throw new ApiError(
      400,
      "Password Not Set For This Account Please Set The Password Or Use Google Sign On!"
    );

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) throw new ApiError(400, "Incorrect Password!");

  req.session.userId = user._id;
  res.status(302).redirect("/");
});

const logout = asyncHandler(async (req, res) => {
  //if (!req.session.userId) throw new ApiError(400, "Please Login!");
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out");
    }
  });

  res.status(302).clearCookie("sessionId").redirect("/");
});

const updateAccountInfo = asyncHandler(async (req, res) => {
  const update = {};
  for (const key of Object.keys(req.body)) {
    if (
      req.body[key] !== "" &&
      req.body[key] !== undefined &&
      req.body[key] !== null
    ) {
      update[key] = req.body[key];
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.session.userId,
    { $set: update },
    { new: true }
  ).select("-__v");

  if (!updatedUser) throw new ApiError(500, "Failed TO Update User!");

  res
    .status(200)
    .json(new ApiResponse(200, true, "Updated Successfully!", updatedUser));
});

// To Do
const updatePassword = asyncHandler((req, res) => {});

const updateEmail = asyncHandler((req, res) => {});

const updatePhoneNumber = asyncHandler((req, res) => {});

export {
  googleAuth,
  googleAuthCallback,
  signup,
  verifyOTP,
  setPassword,
  login,
  logout,
  updateAccountInfo,
};