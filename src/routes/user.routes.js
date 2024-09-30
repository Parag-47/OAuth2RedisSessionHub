import { Router } from "express";
import { validateDto_Body } from "../middlewares/validateDto.middleware.js";
import { validateSignup, validateVerifyOTP, validateSetPassword, validateLogin,  } from "../validation/userValidationSchema.js";
import checkAuthentication from "../middlewares/auth.js";
import {
  googleAuth,
  googleAuthCallback,
  signup,
  verifyOTP,
  setPassword,
  login,
  logout,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/auth/google", googleAuth);
userRouter.get("/auth/google/callback", googleAuthCallback);
userRouter.post("/signup", validateDto_Body(validateSignup), signup);
userRouter.post("/verify-otp", validateDto_Body(validateVerifyOTP), verifyOTP);
userRouter.post("/set-password", validateDto_Body(validateSetPassword), setPassword);
userRouter.post("/login", validateDto_Body(validateLogin), login);
userRouter.get("/logout", checkAuthentication, logout);

export default userRouter;