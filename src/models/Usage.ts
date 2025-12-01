import mongoose, { Schema, InferSchemaType } from "mongoose";

const UsageSchema = new Schema(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    count: { type: Number, default: 0 }
  },
  { timestamps: true }
);

UsageSchema.index({ userId: 1, date: 1 }, { unique: true });

export type UsageDoc = InferSchemaType<typeof UsageSchema>;

export default (mongoose.models.Usage as mongoose.Model<UsageDoc>) ||
  mongoose.model<UsageDoc>("Usage", UsageSchema);
