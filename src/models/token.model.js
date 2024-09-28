import mongoose, { Schema } from "mongoose";

const tokenSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    }
});

// Creating an TTL(Time To Live) index so the record/document gets deleted after 1 hour ¬‿¬
tokenSchema.index( { "createdAt": 1 }, { expireAfterSeconds: 1000 * 60 * 60 } );
export const Token = mongoose.model("Token", tokenSchema);