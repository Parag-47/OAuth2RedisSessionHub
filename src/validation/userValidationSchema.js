import ajv from "./ajvInstance.js";

// Schemas for signup, login and update
const nameSchema = { type: "string", minLength: 3, maxLength: 50 };
const phoneSchema = { type: "string", pattern: "^[0-9]{10}$" };
const emailSchema = { type: "string", format: "email" };
const passwordSchema = { type: "string", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#\\$%\\^&\\*])(?=.{8,})" };

// I don't think i should do it it's a complicated pattern and seem useless to check for it.

  // Schema for token validation
  // const tokenSchema = { type: "string", pattern: "^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$" };

  // const verifyEmailSchema = {
  //   type: "object",
  //   properties: {
  //     token: tokenSchema,
  //   },
  //   required: ["token"],
  //   additionalProperties: false,
  
// };

const signupSchema = {
  type: "object",
  properties: {
    phone: phoneSchema,
    email: emailSchema,
    password: passwordSchema,
  },
  anyOf: [
    { required: ["phone", "password"] },
    { required: ["email", "password"] }
  ],
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
const validateLogin = ajv.compile(loginSchema);

export { validateSignup, validateLogin,  };