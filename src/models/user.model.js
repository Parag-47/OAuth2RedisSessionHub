import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    require: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    require: true,
  },
  password: {
    type: String,
    require: [true, "Password is Required!"],
  },
  phone: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    trim: true,
    lowercase: true,
  },
  verified_email: {
    type: Boolean,
    default: false,
  },
  verified_phone: {
    type: Boolean,
    default: false,
  },
});

// Partial Indexes Not Needed But This How You Can Create Them

// userSchema.index(
//   { email: 1 },
//   {
//     partialFilterExpression: { email: { $exists: true } },
//   }
// );

// userSchema.index(
//   { phone: 1 },
//   {
//     partialFilterExpression: { phone: { $exists: true } },
//   }
// );

export const User = mongoose.model("User", userSchema);