import ajv from "./ajvInstance.js";

// Schemas used for signup, login and update
const nameSchema = { type: "string", minLength: 3, maxLength: 50 };
const phoneSchema = { type: "string", pattern: "^[0-9]{10}$" };
const emailSchema = { type: "string", format: "email" };
const passwordSchema = { type: "string", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#\\$%\\^&\\*])(?=.{8,})" };

// Schema for otp validation
const otpSchema = { type: "string", pattern: "^[a-zA-Z0-9]{6}$" };

const signupSchema = {
  type: "object",
  properties: {
    phone: phoneSchema,
    email: emailSchema,
  },
  anyOf: [
    { required: ["phone"] },
    { required: ["email"] }
  ],
  additionalProperties: false,
};

const verifyOTP = {
  type: "object",
  properties: {
    otp: otpSchema
  },
  required: ["otp"],
  additionalProperties: false,
};

const setPasswordSchema = {
  type: "object",
  properties: {
    password: passwordSchema,
  },
  required: ["password"],
  additionalProperties: false,
};

const loginSchema = {
  type: "object",
  properties: {
    userName: nameSchema,
    phone: phoneSchema,
    email: emailSchema,
    password: passwordSchema,
  },

  anyOf: [
    { required: ["userName", "password"] },
    { required: ["phone", "password"] },
    { required: ["email", "password"] }
  ],
  additionalProperties: false,
};

const validateSignup = ajv.compile(signupSchema);
const validateVerifyOTP = ajv.compile(verifyOTP);
const validateSetPassword = ajv.compile(setPasswordSchema);
const validateLogin = ajv.compile(loginSchema);

export { validateSignup, validateVerifyOTP, validateSetPassword, validateLogin,  };