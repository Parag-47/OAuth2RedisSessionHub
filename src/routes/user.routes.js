import { Router } from "express";
import { validateDto_Body } from "../middlewares/validateDto.middleware.js";
import { validateSignup, validateLogin,  } from "../validation/userValidationSchema.js";
import checkAuthentication from "../middlewares/auth.js";
import {
  googleAuth,
  googleAuthCallback,
  signup,
  verifyEmail,
  login,
  logout,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/auth/google", googleAuth);
userRouter.get("/auth/google/callback", googleAuthCallback);
userRouter.post("/signup", validateDto_Body(validateSignup), signup);
userRouter.get("/verifyEmail/:token", verifyEmail);
userRouter.post("/login", validateDto_Body(validateLogin), login);
userRouter.get("/logout", checkAuthentication, logout);

export default userRouter;