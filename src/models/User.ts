import mongoose, { Schema, InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    providerId: { type: String, unique: true, required: true },
    email: { type: String },
    name: { type: String },
    avatar: { type: String },
    apiKey: { type: String },
    llmProvider: {
      type: String,
      enum: ["groq", "openai", "anthropic", "mistral"],
      default: "groq"
    }
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export default (mongoose.models.User as mongoose.Model<UserDoc>) ||
  mongoose.model<UserDoc>("User", UserSchema);
