import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import {
  isTrustedEmail,
  generateAlphanumericOTP,
  SENDMAIL
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

  let { phone, email, password } = req.body;

  if (!(phone || email) || !password)
    throw new ApiError(400, "All fields are required!");

  if (email) email = email.toLowerCase();

  const existedUser = await User.findOne({
    $or: [
      { phone: { $exists: true, $eq: phone } },
      { email: { $exists: true, $eq: email } },
    ],
  });

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

/*Legacy Code Used For Generating JWT Token Which Then Was Sent To User's Email In The Form Of A Verification Link
  
  const token = createToken(email);
  if (!token) throw new ApiError(500, "Failed to Create Token!");

  const newToken = await Token.create({
    userId: newUser._id,
    token: token,
    createdAt: new Date(),
  });
  
  if (!newToken) throw new ApiError(500, "Failed To Create User!");

  // const ORIGIN =
  //   process.env.NODE_ENV === "production"
  //     ? process.env.PROD_ORIGIN
  //     : process.env.DEV_ORIGIN;

  const link = `${ORIGIN}/api/v1/user/verifyEmail/${otp}`;
  
*/

  const otp = generateAlphanumericOTP(6);

  // const result = await SENDMAIL(email, otp, (info) => {
  //   console.log("info: ", info);
  //   if (info.success) {
  //     console.log("Email sent successfully!", info.messageId);
  //   } else {
  //     //console.error("Failed to send email!", info.error);
  //     throw new ApiError(500, "Failed to send email!", info.error);
  //   }
  // });

  const info = await SENDMAIL(email, otp);
  if(info.success === false) throw new ApiError(500, "Failed to send email!", info);

  // const hashedPassword = await bcrypt.hash(password, 10);

  // const newUser = await User.create({
  //   email: email,
  //   password: hashedPassword,
  // });

  // if (!newUser) throw new ApiError(500, "Failed To Create User!");

  // Redirecting the user to the login page.
  res.status(302).redirect("/loginPage");
});

const resendVerificationCode = asyncHandler(async (req, res) => {

});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  // console.log("token: ", token);
  const decodedToken = isValidToken(token);
  if (!decodedToken) throw new ApiError(500, "Failed To Verify Token!");
  // console.log(decodedToken.email);
  const doesTokenExists = await Token.findOneAndDelete({ token: token });
  // console.log("Deleted Token: ", doesTokenExists);
  if (!doesTokenExists) throw new ApiError(500, "Invalid Token!");
  const verifyUserEmail = await User.findByIdAndUpdate(
    doesTokenExists.userId,
    { $set: { verified_email: true } },
    { new: true }
  );
  console.log("verifyUserEmail: ", verifyUserEmail);
  if (!verifyUserEmail) throw new ApiError(500, "Failed To Verify Email!");
  res
    .status(200)
    .json(new ApiResponse(200, true, "Email Verified Successfully!"));
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
  verifyEmail,
  login,
  logout,
  updateAccountInfo,
};
